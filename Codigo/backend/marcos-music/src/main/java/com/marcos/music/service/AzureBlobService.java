package com.marcos.music.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobContainerClientBuilder;

@Service
public class AzureBlobService {

    private final BlobContainerClient containerClient;
    private final Path uploadDir;

    public AzureBlobService(
            @Value("${azure.storage.connection-string:}") String connectionString,
            @Value("${azure.storage.container-name:data}") String containerName,
            @Value("${app.upload-dir:${java.io.tmpdir}/uploads}") String uploadDir) {

        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível criar o diretório de uploads", e);
        }

        if (connectionString == null || connectionString.isBlank()) {
            this.containerClient = null;
        } else {
            this.containerClient = new BlobContainerClientBuilder()
                    .connectionString(connectionString)
                    .containerName(containerName)
                    .buildClient();
        }
    }

    public String upload(MultipartFile file) throws IOException {
        if (containerClient != null) {
            String originalName = file.getOriginalFilename();
            String fileName = UUID.randomUUID() + "_" + originalName;

            BlobClient blobClient = containerClient.getBlobClient(fileName);
            blobClient.upload(file.getInputStream(), file.getSize(), true);

            return blobClient.getBlobUrl();
        }

        return uploadLocally(file);
    }

    public void delete(String fileUrl) {
        if (containerClient != null) {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            BlobClient blobClient = containerClient.getBlobClient(fileName);

            if (blobClient.exists()) {
                blobClient.delete();
            } else {
                throw new RuntimeException("Arquivo não encontrado no Azure Blob Storage");
            }
            return;
        }

        deleteLocally(fileUrl);
    }

    private String uploadLocally(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "arquivo";
        }

        String safeOriginalName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = UUID.randomUUID() + "_" + safeOriginalName;
        Path target = uploadDir.resolve(fileName).normalize();

        if (!target.startsWith(uploadDir)) {
            throw new IOException("Nome de arquivo inválido");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();
    }

    private void deleteLocally(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        Path target = uploadDir.resolve(fileName).normalize();

        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao remover arquivo local", e);
        }
    }
}

package com.marcos.music.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClientBuilder;

@Service
public class AzureBlobService {

    private final BlobContainerClient containerClient;

    public AzureBlobService(
            @Value("${azure.storage.connection-string:}") String connectionString,
            @Value("${azure.storage.container-name:data}") String containerName) {

        if (connectionString == null || connectionString.isBlank()) {
            // Azure Storage not configured — upload/delete calls will fail at runtime
            this.containerClient = null;
        } else {
            this.containerClient = new BlobContainerClientBuilder()
                    .connectionString(connectionString)
                    .containerName(containerName)
                    .buildClient();
        }
    }

    public String upload(MultipartFile file) throws IOException {
        requireClient();

        String originalName = file.getOriginalFilename();
        String fileName = UUID.randomUUID() + "_" + originalName;

        BlobClient blobClient = containerClient.getBlobClient(fileName);
        blobClient.upload(file.getInputStream(), file.getSize(), true);

        return blobClient.getBlobUrl();
    }

    public void delete(String fileUrl) {
        requireClient();

        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        BlobClient blobClient = containerClient.getBlobClient(fileName);

        if (blobClient.exists()) {
            blobClient.delete();
        } else {
            throw new RuntimeException("Arquivo não encontrado no Azure Blob Storage");
        }
    }

    private void requireClient() {
        if (containerClient == null) {
            throw new IllegalStateException(
                    "Azure Blob Storage não está configurado. " +
                    "Defina a variável de ambiente AZURE_STORAGE_CONNECTION_STRING.");
        }
    }
}

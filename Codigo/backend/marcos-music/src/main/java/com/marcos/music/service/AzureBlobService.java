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
            @Value("${azure.storage.connection-string}") String connectionString,
            @Value("${azure.storage.container-name}") String containerName) {

        this.containerClient = new BlobContainerClientBuilder()
                .connectionString(connectionString)
                .containerName(containerName)
                .buildClient();
    }

    public String upload(MultipartFile file) throws IOException {

        String originalName = file.getOriginalFilename();

        String fileName = UUID.randomUUID() + "_" + originalName;

        BlobClient blobClient = containerClient.getBlobClient(fileName);

        blobClient.upload(file.getInputStream(), file.getSize(), true);

        return blobClient.getBlobUrl();
    }

    public void delete(String fileUrl) {

    String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

    BlobClient blobClient = containerClient.getBlobClient(fileName);

    if (blobClient.exists()) {
        blobClient.delete();
    } else {
        throw new RuntimeException("Arquivo não encontrado no Azure Blob Storage");
    }
}
}

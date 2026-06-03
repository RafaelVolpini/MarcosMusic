package com.marcos.music.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.marcos.music.dto.UploadModulo.ModuloDTO;
import com.marcos.music.dto.UploadModulo.UploadModuloDTO;
import com.marcos.music.entity.Modulo;
import com.marcos.music.entity.UploadModulo;
import com.marcos.music.repository.ModuloRepository;
import com.marcos.music.repository.UploadModuloRepository;

@Service
public class UploadModuloService {
    private final UploadModuloRepository uploadModuloRepository;
    private final ModuloRepository moduloRepository;
    private final AzureBlobService azureBlobService;

    public UploadModuloService(UploadModuloRepository uploadModuloRepository, ModuloRepository moduloRepository, AzureBlobService azureBlobService) {
        this.uploadModuloRepository = uploadModuloRepository;
        this.moduloRepository = moduloRepository;
        this.azureBlobService = azureBlobService;
    }

    public void criarModulo(ModuloDTO dto) {
        moduloRepository.save(new Modulo(dto));
    }

    public void upload(MultipartFile file, UploadModuloDTO dto) throws Exception {
        String url = azureBlobService.upload(file);
        UploadModulo uploadModulo = new UploadModulo(dto);
        uploadModulo.setUrl(url);
        uploadModuloRepository.save(uploadModulo);
    }

    public void atualizarUpload(Long id, MultipartFile file) throws Exception {
        UploadModulo uploadModulo = uploadModuloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Upload não encontrado"));

        azureBlobService.delete(uploadModulo.getUrl());
        
        String url = azureBlobService.upload(file);
        uploadModulo.setUrl(url);

        uploadModuloRepository.save(uploadModulo);
    }
}

package com.marcos.music.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.marcos.music.dto.UploadModulo.ModuloDTO;
import com.marcos.music.dto.UploadModulo.UploadModuloDTO;
import com.marcos.music.entity.Modulo;
import com.marcos.music.entity.UploadModulo;
import com.marcos.music.repository.ModuloRepository;
import com.marcos.music.repository.UploadModuloRepository;

import java.util.List;
import java.util.stream.Collectors;

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

    public List<ModuloDTO> listarModulos() {
        return moduloRepository.findAll().stream()
                .map(modulo -> {
                    ModuloDTO dto = new ModuloDTO();
                    dto.setId(modulo.getId());
                    dto.setNome(modulo.getNome());
                    List<UploadModuloDTO> uploads = modulo.getUploads().stream()
                            .map(upload -> {
                                UploadModuloDTO uploadDto = new UploadModuloDTO();
                                uploadDto.setId(upload.getId());
                                uploadDto.setNome(upload.getNome());
                                uploadDto.setDescricao(upload.getDescricao());
                                uploadDto.setUrl(upload.getUrl());
                                uploadDto.setIdModulo(upload.getModulo().getId());
                                return uploadDto;
                            })
                            .collect(Collectors.toList());
                    dto.setUploads(uploads);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public ModuloDTO obterModulo(Long id) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo não encontrado"));

        ModuloDTO dto = new ModuloDTO();
        dto.setId(modulo.getId());
        dto.setNome(modulo.getNome());
        List<UploadModuloDTO> uploads = modulo.getUploads().stream()
                .map(upload -> {
                    UploadModuloDTO uploadDto = new UploadModuloDTO();
                    uploadDto.setId(upload.getId());
                    uploadDto.setNome(upload.getNome());
                    uploadDto.setDescricao(upload.getDescricao());
                    uploadDto.setUrl(upload.getUrl());
                    uploadDto.setIdModulo(upload.getModulo().getId());
                    return uploadDto;
                })
                .collect(Collectors.toList());
        dto.setUploads(uploads);
        return dto;
    }

    @Transactional
    public void deletarUpload(Long id) {
        UploadModulo uploadModulo = uploadModuloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Upload não encontrado"));

        azureBlobService.delete(uploadModulo.getUrl());
        uploadModuloRepository.deleteById(id);
    }

    public void editarModulo(Long id, String nome) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo não encontrado"));
        modulo.setNome(nome);
        moduloRepository.save(modulo);
    }

    @Transactional
    public void deletarModulo(Long id) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo não encontrado"));

        for (UploadModulo upload : modulo.getUploads()) {
            azureBlobService.delete(upload.getUrl());
        }

        moduloRepository.deleteById(id);
    }
}

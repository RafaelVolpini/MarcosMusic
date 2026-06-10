package com.marcos.music.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcos.music.dto.UploadModulo.ModuloDTO;
import com.marcos.music.dto.UploadModulo.UploadModuloDTO;
import com.marcos.music.service.UploadModuloService;


@RestController
@RequestMapping("/upload-modulo")
public class UploadModuloController {

    private final UploadModuloService uploadModuloService;
    private final ObjectMapper objectMapper;

    public UploadModuloController(
            UploadModuloService uploadModuloService,
            ObjectMapper objectMapper) {

        this.uploadModuloService = uploadModuloService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/modulo")
    @ResponseStatus(HttpStatus.CREATED)
    public void criarModulo(@RequestBody ModuloDTO dto) {

        uploadModuloService.criarModulo(dto);
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public void upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("dto") String dtoJson) throws Exception {

        UploadModuloDTO dto = objectMapper.readValue(
                dtoJson,
                UploadModuloDTO.class);

        uploadModuloService.upload(file, dto);
    }

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public void atualizarUpload(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) throws Exception {

        uploadModuloService.atualizarUpload(id, file);
    }
}

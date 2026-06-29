package com.marcos.music.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcos.music.dto.UploadModulo.ModuloDTO;
import com.marcos.music.dto.UploadModulo.UploadModuloDTO;
import com.marcos.music.service.UploadModuloService;

import java.util.List;


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

    @GetMapping("/modulos")
    public ResponseEntity<List<ModuloDTO>> listarModulos() {
        List<ModuloDTO> modulos = uploadModuloService.listarModulos();
        return ResponseEntity.ok(modulos);
    }

    @GetMapping("/modulo/{id}")
    public ResponseEntity<ModuloDTO> obterModulo(@PathVariable Long id) {
        ModuloDTO modulo = uploadModuloService.obterModulo(id);
        return ResponseEntity.ok(modulo);
    }

    @PutMapping("/modulo/{id}")
    public ResponseEntity<Void> editarModulo(@PathVariable Long id, @RequestBody ModuloDTO dto) {
        uploadModuloService.editarModulo(id, dto.getNome());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/modulo/{id}")
    public ResponseEntity<Void> deletarModulo(@PathVariable Long id) {
        uploadModuloService.deletarModulo(id);
        return ResponseEntity.noContent().build();
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUpload(@PathVariable Long id) {
        uploadModuloService.deletarUpload(id);
        return ResponseEntity.noContent().build();
    }
}

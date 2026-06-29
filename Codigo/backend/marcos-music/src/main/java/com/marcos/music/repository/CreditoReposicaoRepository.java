package com.marcos.music.repository;

import com.marcos.music.entity.CreditoReposicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface CreditoReposicaoRepository extends JpaRepository<CreditoReposicao, Long> {

    /**
     * Retorna créditos válidos e não expirados do aluno
     */
    @Query("""
        SELECT c FROM CreditoReposicao c
        WHERE c.aluno.id = :alunoId
        AND c.status = 'VALIDO'
        AND c.dataExpiracao > CURRENT_TIMESTAMP
        ORDER BY c.dataExpiracao ASC
        """)
    List<CreditoReposicao> findCreditosDisponiveisParaAluno(@Param("alunoId") UUID alunoId);

    /**
     * Conta créditos válidos e não expirados
     */
    @Query("""
        SELECT COUNT(c) FROM CreditoReposicao c
        WHERE c.aluno.id = :alunoId
        AND c.status = 'VALIDO'
        AND c.dataExpiracao > CURRENT_TIMESTAMP
        """)
    int contarCreditosDisponiveisParaAluno(@Param("alunoId") UUID alunoId);

    /**
     * Retorna todos os créditos do aluno (para histórico)
     */
    List<CreditoReposicao> findByAlunoIdOrderByDataCriacaoDesc(UUID alunoId);

    /**
     * Encontra créditos que expiraram para marcar como EXPIRADO
     */
    @Query("""
        SELECT c FROM CreditoReposicao c
        WHERE c.status = 'VALIDO'
        AND c.dataExpiracao <= CURRENT_TIMESTAMP
        """)
    List<CreditoReposicao> findCreditosVencidos();

    /**
     * Marca créditos como expirados
     */
    @Modifying
    @Transactional
    @Query("""
        UPDATE CreditoReposicao c
        SET c.status = 'EXPIRADO'
        WHERE c.status = 'VALIDO'
        AND c.dataExpiracao <= CURRENT_TIMESTAMP
        """)
    int expirarCreditosVencidos();

    /**
     * Retorna crédito gerado por uma aula (se houver)
     */
    CreditoReposicao findByAulaId(Long aulaId);

    /**
     * Retorna todos os créditos vinculados a uma reposição
     */
    List<CreditoReposicao> findByReposicaoId(Long reposicaoId);
}

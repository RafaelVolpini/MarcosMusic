package com.marcos.music.repository.Aula;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.stereotype.Repository;

import com.marcos.music.dto.Aula.CalendarFilterDTO;
import com.marcos.music.dto.Aula.CalendarResponseDTO;
import com.marcos.music.entity.Aluno;
import com.marcos.music.entity.Aula;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.TypedQuery;

@Repository
@RequiredArgsConstructor
public class AulaCustomRepository {
    private final EntityManager em;

    public List<CalendarResponseDTO> buscar(CalendarFilterDTO f){
        CriteriaBuilder cb = em.getCriteriaBuilder();

        CriteriaQuery<CalendarResponseDTO> query = cb.createQuery(CalendarResponseDTO.class);

        List<Predicate> predicates = new ArrayList<>();

        Root<Aula> root = query.from(Aula.class);
        Join<Aula, Aluno> aluno = root.join("aluno", JoinType.LEFT);

        query.select(cb.construct(
                CalendarResponseDTO.class,
                root.get("id"),
                root.get("dataInicio"),
                root.get("dataFim"),
                aluno.get("id"),
                aluno.get("nome"),
                root.get("flagCancelada"),
                root.get("presencaConfirmada"),
                root.get("recorrente"),
                root.get("flagRealizada"),
                root.get("meetLink"),
                root.get("isOnline")
        ));

        query.distinct(true);
        predicates.add(cb.equal(root.get("flagCancelada"), false));

        if (f.getDataInicio() != null && f.getDataFim() == null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("dataInicio"), f.getDataInicio()));
        }

        if (f.getDataFim() != null && f.getDataInicio() == null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("dataInicio"), f.getDataFim()));
        }

        if (f.getDataInicio() != null && f.getDataFim() != null) {
            predicates.add(cb.between(root.get("dataInicio"), f.getDataInicio(), f.getDataFim()));
        }

        query.where(cb.and(predicates.toArray(new Predicate[0])));

        TypedQuery<CalendarResponseDTO> typedQuery = em.createQuery(query);
        return typedQuery.getResultList();
    }
}

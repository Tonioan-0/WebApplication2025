package it.fithub.fithubspring.controller.workout;

import org.springframework.web.bind.annotation.*;
import it.fithub.fithubspring.dto.workout.ExercisePresetDto;
import it.fithub.fithubspring.repository.ExercisesRepository;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "http://localhost:4200")
public class ExercisesController {
    private final ExercisesRepository repo;

    public ExercisesController(ExercisesRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<ExercisePresetDto> all() {
        return repo.findAll();
    }
}

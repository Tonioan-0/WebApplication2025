package it.fithub.fithubspring.service;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeBaseService {

    public String findContext(String userMessage) {
        return "Context: The user is asking about nutrition. Safe advice includes eating lean proteins and vegetables.";
    }
}

package it.fithub.fithubspring.service;

import it.fithub.fithubspring.domain.Blacklist;
import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.repository.BlacklistRepository;
import it.fithub.fithubspring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

//Service per le operazioni di amministrazione: ban/unban utenti.
@Service
public class AdminService {

    private final BlacklistRepository blacklistRepository;
    private final UserRepository userRepository;

    public AdminService(BlacklistRepository blacklistRepository, UserRepository userRepository) {
        this.blacklistRepository = blacklistRepository;
        this.userRepository = userRepository;
    }

    /**
     * Banna un utente tramite ID o email.
     *  adminId ID dell'admin che esegue il ban
     *  userIdOrEmail ID numerico o email dell'utente da bannare
     *  reason Motivo del ban
     *  Blacklist entry creata
     */
    public Blacklist banUser(Long adminId, String userIdOrEmail, String reason) {
        User user = findUserByIdOrEmail(userIdOrEmail);
        
        if (user == null) {
            throw new IllegalArgumentException("Utente non trovato: " + userIdOrEmail);
        }

        // Verifica se è già bannato
        Optional<Blacklist> existing = blacklistRepository.findByUserId(user.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Utente già bannato");
        }

        // Verifica che non stia bannando se stesso
        if (user.getId().equals(adminId)) {
            throw new IllegalArgumentException("Non puoi bannare te stesso");
        }

        // Verifica che non stia bannando un altro admin
        if (Boolean.TRUE.equals(user.getIsAdmin())) {
            throw new IllegalArgumentException("Non puoi bannare un altro amministratore");
        }

        Blacklist blacklist = new Blacklist();
        blacklist.setUserId(user.getId());
        blacklist.setEmail(user.getEmail());
        blacklist.setReason(reason);
        blacklist.setBannedBy(adminId);

        return blacklistRepository.save(blacklist);
    }

    //Rimuove il ban di un utente
    public void unbanUser(Long userId) {
        blacklistRepository.deleteByUserId(userId);
    }

    //Verifica se un utente è bannato tramite userId
    public boolean isUserBanned(Long userId) {
        return blacklistRepository.findByUserId(userId).isPresent();
    }

    //Verifica se un utente è bannato tramite email
    public boolean isEmailBanned(String email) {
        return blacklistRepository.findByEmail(email).isPresent();
    }

    //Ottiene il motivo del ban per id utente
    public String getBanReason(Long userId) {
        return blacklistRepository.findByUserId(userId)
                .map(Blacklist::getReason)
                .orElse(null);
    }

    //Ottiene il motivo del ban tramite email
    public String getBanReasonByEmail(String email) {
        return blacklistRepository.findByEmail(email)
                .map(Blacklist::getReason)
                .orElse(null);
    }

    //Ottiene la lista completa degli utenti bannati
    public List<Blacklist> getBlacklist() {
        return blacklistRepository.findAll();
    }

    //Trova un utente tramite ID numerico o email
    private User findUserByIdOrEmail(String userIdOrEmail) {
        // Prova prima come ID numerico
        try {
            Long userId = Long.parseLong(userIdOrEmail);
            return userRepository.findById(userId).orElse(null);
        } catch (NumberFormatException e) {
            // Non è un numero, prova come email
            return userRepository.findByEmail(userIdOrEmail).orElse(null);
        }
    }
}

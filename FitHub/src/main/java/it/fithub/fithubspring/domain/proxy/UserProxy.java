package it.fithub.fithubspring.domain.proxy;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.domain.community.Appointment;
import it.fithub.fithubspring.repository.community.AppointmentRepository;

import java.util.List;

public class UserProxy extends User {

    private final AppointmentRepository appointmentRepository;
    private boolean appointmentsLoaded = false;

    public UserProxy(Long id, AppointmentRepository appointmentRepository) {
        this.setId(id);
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public List<Appointment> getAppointments() {
        if (!appointmentsLoaded) {
            List<Appointment> appointments = appointmentRepository.findByCreatorId(getId());
            super.setAppointments(appointments);
            appointmentsLoaded = true;
        }
        return super.getAppointments();
    }
}

package com.enterprise.api.admin.service;

import com.enterprise.api.admin.model.dto.CustomerDTO;
import com.enterprise.api.admin.model.entity.Customer;
import com.enterprise.api.admin.repository.CustomerRepository;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final CustomerRepository customerRepository;

    @Transactional
    public CustomerDTO.CustomerResponse createCustomer(CustomerDTO.CreateCustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered: " + request.getEmail(),
                    HttpStatus.CONFLICT, "EMAIL_TAKEN");
        }
        Customer customer = new Customer();
        mapRequest(request, customer);
        log.info("Customer created: {}", customer.getEmail());
        return toResponse(customerRepository.save(customer));
    }

    public Page<CustomerDTO.CustomerResponse> findAllCustomers(String query,
                                                                Customer.Status status,
                                                                Pageable pageable) {
        Page<Customer> page;
        if (query != null && !query.isBlank()) {
            page = customerRepository.findWithFilters(status, query, pageable);
        } else if (status != null) {
            page = customerRepository.findByStatus(status, pageable);
        } else {
            page = customerRepository.findAll(pageable);
        }
        return page.map(this::toResponse);
    }

    public CustomerDTO.CustomerResponse findCustomerById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public CustomerDTO.CustomerResponse updateCustomer(Long id, CustomerDTO.UpdateCustomerRequest request) {
        Customer customer = getOrThrow(id);
        if (request.getFirstName() != null) customer.setFirstName(request.getFirstName());
        if (request.getLastName() != null) customer.setLastName(request.getLastName());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getCompany() != null) customer.setCompany(request.getCompany());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getCity() != null) customer.setCity(request.getCity());
        if (request.getCountry() != null) customer.setCountry(request.getCountry());
        if (request.getNotes() != null) customer.setNotes(request.getNotes());
        if (request.getStatus() != null) customer.setStatus(request.getStatus());
        if (request.getPreferredLanguage() != null) customer.setPreferredLanguage(request.getPreferredLanguage());
        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public void deleteCustomer(Long id) {
        getOrThrow(id);
        customerRepository.deleteById(id);
        log.info("Customer deleted: {}", id);
    }

    public CustomerDTO.CustomerStats getCustomerStats() {
        CustomerDTO.CustomerStats stats = new CustomerDTO.CustomerStats();
        stats.setTotal(customerRepository.count());
        stats.setActive(customerRepository.countByStatus(Customer.Status.ACTIVE));
        stats.setInactive(customerRepository.countByStatus(Customer.Status.INACTIVE));
        stats.setBlocked(customerRepository.countByStatus(Customer.Status.BLOCKED));
        return stats;
    }

    private Customer getOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ApiException("Customer not found: " + id, HttpStatus.NOT_FOUND));
    }

    private void mapRequest(CustomerDTO.CreateCustomerRequest request, Customer customer) {
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setCompany(request.getCompany());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setCountry(request.getCountry());
        customer.setNotes(request.getNotes());
        customer.setPreferredLanguage(request.getPreferredLanguage());
    }

    private CustomerDTO.CustomerResponse toResponse(Customer c) {
        CustomerDTO.CustomerResponse r = new CustomerDTO.CustomerResponse();
        r.setId(c.getId());
        r.setFirstName(c.getFirstName());
        r.setLastName(c.getLastName());
        r.setEmail(c.getEmail());
        r.setPhone(c.getPhone());
        r.setCompany(c.getCompany());
        r.setAddress(c.getAddress());
        r.setCity(c.getCity());
        r.setCountry(c.getCountry());
        r.setStatus(c.getStatus());
        r.setNotes(c.getNotes());
        r.setPreferredLanguage(c.getPreferredLanguage());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}

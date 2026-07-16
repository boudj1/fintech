package com.enterprise.api.admin;

import com.enterprise.api.admin.model.dto.CustomerDTO;
import com.enterprise.api.admin.model.entity.Customer;
import com.enterprise.api.admin.repository.CustomerRepository;
import com.enterprise.api.admin.service.AdminService;
import com.enterprise.core.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private CustomerRepository customerRepository;

    @InjectMocks private AdminService adminService;

    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
        testCustomer.setEmail("john.doe@example.com");
        testCustomer.setStatus(Customer.Status.ACTIVE);
    }

    @Test
    void createCustomer_newEmail_returnsCustomer() {
        when(customerRepository.existsByEmail("john.doe@example.com")).thenReturn(false);
        when(customerRepository.save(any())).thenReturn(testCustomer);

        CustomerDTO.CreateCustomerRequest request = new CustomerDTO.CreateCustomerRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");

        CustomerDTO.CustomerResponse response = adminService.createCustomer(request);

        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        verify(customerRepository).save(any());
    }

    @Test
    void createCustomer_duplicateEmail_throwsException() {
        when(customerRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        CustomerDTO.CreateCustomerRequest request = new CustomerDTO.CreateCustomerRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");

        assertThrows(ApiException.class, () -> adminService.createCustomer(request));
        verify(customerRepository, never()).save(any());
    }

    @Test
    void findCustomerById_exists_returnsCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));

        CustomerDTO.CustomerResponse response = adminService.findCustomerById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void findCustomerById_notFound_throwsException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ApiException.class, () -> adminService.findCustomerById(99L));
    }

    @Test
    void deleteCustomer_exists_deletesSuccessfully() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));

        assertDoesNotThrow(() -> adminService.deleteCustomer(1L));
        verify(customerRepository).deleteById(1L);
    }
}

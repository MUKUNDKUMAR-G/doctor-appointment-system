import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("Admin123! hash: " + encoder.encode("Admin123!"));
        System.out.println("Doctor123! hash: " + encoder.encode("Doctor123!"));
    }
}

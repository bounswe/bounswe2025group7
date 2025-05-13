package heatH.heatHBack.service.implementation;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    public void sendEmail(String to, String subject, String body) {
        try {
            Email from = new Email("heath352.451@gmail.com");
            Email toEmail = new Email(to);
            Content content = new Content("text/html", body);
            Mail mail = new Mail(from, subject, toEmail, content);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            System.out.println("Status Code: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody());
            System.out.println("Headers: " + response.getHeaders());

            if (response.getStatusCode() >= 400) {
                throw new RuntimeException("Failed to send email: " + response.getBody());
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}

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

    @Value("${app.base-url:http://167.172.162.159:8080}")
    private String baseUrl;

    public void sendEmail(String to, String subject, String body) {
        try {
            Email from = new Email("heath352.451@gmail.com");
            Email toEmail = new Email(to);
            String htmlBody = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                    "<meta charset=\"UTF-8\">" +
                    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                    "<style>" +
                        "body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; }" +
                        ".wrapper { width: 100%; padding: 20px 0; }" +
                        ".brand { text-align: center; font-size: 32px; font-weight: bold; margin-bottom: 20px; color: #4CAF50; }" +
                        ".container { max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; }" +
                        ".header { padding: 20px; text-align: center; background-color: #ffffff; }" +
                        ".header h1 { margin: 0; font-size: 24px; color: #333333; }" +
                        ".body-content { padding: 20px; font-size: 16px; color: #333333; }" +
                        ".code { display: block; font-size: 32px; font-weight: bold; color: #333333; text-align: center; background-color: #EEF2FA; padding: 20px; border-radius: 5px; margin: 20px 0; }" +
                        ".info { padding: 0 20px 20px; font-size: 14px; color: #555555; }" +
                        ".button-container { text-align: center; padding-bottom: 20px; }" +
                        ".button { background-color: #4CAF50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }" +
                        ".tips { padding: 20px; background-color: #f9f9f9; }" +
                        ".tips h3 { margin-top: 0; }" +
                        ".tips ul { list-style-type: disc; padding-left: 20px; margin: 0; }" +
                        ".footer { text-align: center; padding: 20px; font-size: 12px; color: #aaaaaa; background-color: #ffffff; }" +
                        ".footer a { color: #4CAF50; text-decoration: none; margin: 0 5px; }" +
                    "</style>" +
                "</head>" +
                "<body>" +
                    "<div class=\"wrapper\">" +
                        "<div class=\"brand\">HeatH</div>" +
                        "<div class=\"container\">" +
                            "<div class=\"header\"><h1>" + subject + "</h1></div>" +
                            "<div class=\"body-content\">" + body + "</div>" +
                            "<div class=\"info\">" +
                                "<p>Please enter this code in the login prompt to access your account. If you did not request this code or you are not trying to access your account, please contact us immediately for support.</p>" +
                            "</div>" +
                            "<div class=\"button-container\">" +
                                "<a href=\"" + baseUrl + "\" class=\"button\">Visit your account</a>" +
                            "</div>" +
                            "<div class=\"tips\">" +
                                "<h3>Security Tips</h3>" +
                                "<ul>" +
                                    "<li>Never share your 2FA codes with anyone.</li>" +
                                    "<li>Enable notifications for all account activities.</li>" +
                                    "<li>Use a trusted device and secure connection when accessing your account.</li>" +
                                "</ul>" +
                            "</div>" +
                            "<div class=\"footer\">" +
                                "<p><a href=\"" + baseUrl>Privacy Policy</a> | <a href=\"" + baseUrl>Contact Us</a> | <a href=\"" + baseUrl>Unsubscribe</a></p>" +
                            "</div>" ++
                        "</div>" +
                    "</div>" +
                "</body>" +
            "</html>";
            Content content = new Content("text/html", htmlBody);
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

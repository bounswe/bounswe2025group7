package heatH.heatHBack.service.implementation;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class GcsService {

    private final Storage storage;

    @Value("${gcp.bucket.name}")
    private String bucketName;

    public GcsService(Storage storage) {
        this.storage = storage;
    }

    public String uploadBase64Image(String base64Image, String fileName) {
        byte[] decodedBytes = Base64.getDecoder().decode(base64Image.split(",")[1]); // split for "data:image/png;base64,..."

        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType("image/jpeg") // or detect from base64
                .build();

        storage.create(blobInfo, decodedBytes);

        return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
    }
}

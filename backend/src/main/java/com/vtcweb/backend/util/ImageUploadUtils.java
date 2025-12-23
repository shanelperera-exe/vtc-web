package com.vtcweb.backend.util;

import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Helper utilities for working with image uploads from the admin apps.
 */
public final class ImageUploadUtils {

    private static final Pattern DATA_URI_PATTERN = Pattern.compile("^data:(?<mime>[^;]+);base64,(?<data>.+)$",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern CLOUDINARY_HOST_PATTERN = Pattern
            .compile("^https://res\\.cloudinary\\.com/[^/]+/image/upload/.*$", Pattern.CASE_INSENSITIVE);

    private ImageUploadUtils() {
    }

    /**
     * Returns {@code true} if the provided value looks like a data URI
     * (data:image/...;base64,...).
     */
    public static boolean isDataUri(String value) {
        if (value == null)
            return false;
        return DATA_URI_PATTERN.matcher(value.trim()).matches();
    }

    /**
     * Returns true if the URL already points to a Cloudinary image upload resource
     * (secure).
     */
    public static boolean isCloudinaryUrl(String value) {
        if (value == null)
            return false;
        return CLOUDINARY_HOST_PATTERN.matcher(value.trim()).matches();
    }

    /**
     * Download a remote HTTP(S) image (non-Cloudinary) and wrap it as a
     * MultipartFile for re-upload.
     * Enforces a basic 5MB size cap to avoid large transfers.
     */
    public static MultipartFile remoteImageToMultipart(String urlString, String nameHint) {
        if (urlString == null || urlString.isBlank())
            throw new IllegalArgumentException("url required");
        try {
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);
            conn.setInstanceFollowRedirects(true);
            int code = conn.getResponseCode();
            if (code >= 300 && code < 400) {
                String loc = conn.getHeaderField("Location");
                if (loc != null) {
                    conn.disconnect();
                    return remoteImageToMultipart(loc, nameHint);
                }
            }
            if (code != 200)
                throw new IllegalArgumentException("Remote image fetch failed HTTP " + code);
            String contentType = conn.getContentType();
            if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
                throw new IllegalArgumentException("URL does not point to an image");
            }
            int len = conn.getContentLength();
            if (len > 5 * 1024 * 1024) {
                throw new IllegalArgumentException("Remote image too large (>5MB)");
            }
            byte[] data;
            try (InputStream in = conn.getInputStream()) {
                data = in.readAllBytes();
            }
            if (data.length == 0)
                throw new IllegalArgumentException("Empty remote image");
            String extension = determineExtension(contentType);
            String fileName = buildFileName(nameHint, extension);
            return new InMemoryMultipartFile(fileName, fileName, contentType, data);
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to download remote image", e);
        }
    }

    /**
     * Convert a data URI into an in-memory {@link MultipartFile} so it can be
     * passed to storage services.
     * 
     * @param dataUri  the data URI string
     * @param nameHint optional name hint used to build the filename (without
     *                 extension)
     * @return multipart file containing the decoded bytes
     */
    public static MultipartFile dataUriToMultipartFile(String dataUri, String nameHint) {
        if (!isDataUri(dataUri)) {
            throw new IllegalArgumentException("Value is not a valid data URI");
        }
        Matcher matcher = DATA_URI_PATTERN.matcher(dataUri.trim());
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Unable to parse data URI");
        }
        String mime = matcher.group("mime");
        String dataPart = matcher.group("data");
        byte[] content = Base64.getDecoder().decode(dataPart);
        String extension = determineExtension(mime);
        String fileName = buildFileName(nameHint, extension);
        return new InMemoryMultipartFile(fileName, fileName, mime != null ? mime : "image/png", content);
    }

    private static String buildFileName(String nameHint, String extension) {
        String base = (nameHint == null || nameHint.isBlank()) ? "image" : nameHint.trim();
        if (extension == null || extension.isBlank()) {
            return base;
        }
        return base + (base.endsWith(".") ? "" : ".") + extension;
    }

    private static String determineExtension(String mime) {
        if (mime == null)
            return "png";
        String normalized = mime.toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "image/png" -> "png";
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/webp" -> "webp";
            case "image/svg+xml" -> "svg";
            default -> "png";
        };
    }

    /** Simple in-memory MultipartFile implementation. */
    private static final class InMemoryMultipartFile implements MultipartFile {
        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] content;

        private InMemoryMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
            this.name = Objects.requireNonNullElse(name, "image");
            this.originalFilename = originalFilename != null ? originalFilename : this.name;
            this.contentType = contentType;
            this.content = Objects.requireNonNull(content, "content");
        }

        @Override
        @NonNull
        public String getName() {
            return Objects.requireNonNull(name, "name");
        }

        @Override
        public String getOriginalFilename() {
            return originalFilename;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        @NonNull
        public byte[] getBytes() {
            return content.clone();
        }

        @Override
        @NonNull
        public InputStream getInputStream() {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(@NonNull java.io.File dest) throws IOException {
            java.nio.file.Files.write(dest.toPath(), content);
        }
    }
}

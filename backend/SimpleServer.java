import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class SimpleServer {
    public static void main(String[] args) {
        int port = 8081; // 8081 포트 사용
        
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("🚀 간단한 서버가 포트 " + port + "에서 시작되었습니다.");
            System.out.println("📍 접속 URL: http://localhost:" + port);
            System.out.println("📍 WebSocket URL: ws://localhost:" + port + "/ws");
            
            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("✅ 클라이언트 연결됨: " + clientSocket.getInetAddress());
                
                // HTTP 응답 전송
                PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
                BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                
                // HTTP 요청 읽기
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    if (inputLine.isEmpty()) {
                        break;
                    }
                    System.out.println("📨 요청: " + inputLine);
                }
                
                // HTTP 응답 전송
                out.println("HTTP/1.1 200 OK");
                out.println("Content-Type: text/html; charset=UTF-8");
                out.println("Access-Control-Allow-Origin: *");
                out.println("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
                out.println("Access-Control-Allow-Headers: *");
                out.println();
                out.println("<html><body>");
                out.println("<h1>✅ 간단한 서버가 정상 작동 중입니다!</h1>");
                out.println("<p>포트: " + port + "</p>");
                out.println("<p>시간: " + java.time.LocalDateTime.now() + "</p>");
                out.println("<p>WebSocket 테스트: <a href='ws://localhost:" + port + "/ws'>ws://localhost:" + port + "/ws</a></p>");
                out.println("</body></html>");
                
                clientSocket.close();
            }
        } catch (IOException e) {
            System.err.println("❌ 서버 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }
}




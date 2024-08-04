import http.server
import socketserver


def find_available_port(start_port=8000, max_tries=100):
    port = start_port
    for _ in range(max_tries):
        with socketserver.TCPServer(
            ("localhost", port), http.server.SimpleHTTPRequestHandler
        ) as httpd:
            try:
                return httpd.server_address[1]
            except OSError:
                port += 1
    raise RuntimeError("No available ports found")


# Find an available port starting from 8000
PORT = find_available_port()

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

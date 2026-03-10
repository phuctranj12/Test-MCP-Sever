# Chatbot MCP Client

Giao diện chat box hiện đại, sạch sẽ để tương tác với MCP Server Python cho việc gửi email tự động.

## Tính năng

- Giao diện chat hiện đại với thiết kế gradient và hiệu ứng blur
- Responsive design cho mobile và desktop
- Tích hợp với MCP Server để gửi email tự động
- Components React được chia rõ ràng

## Cấu trúc Components

```
src/
├── components/
│   ├── ChatBox.js      # Component chính
│   ├── MessageList.js  # Danh sách tin nhắn
│   ├── Message.js      # Component tin nhắn đơn
│   ├── ChatInput.js    # Input để gửi tin nhắn
│   └── ChatBox.css     # Styles hiện đại
├── services/
│   └── (reserved for future MCP client)
├── App.js
└── App.css
```

## Cách chạy

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Chạy backend server (bridge cho MCP):**
   ```bash
   npm run server
   ```
   Server sẽ chạy trên port 3001.

3. **Chạy React app (trong terminal khác):**
   ```bash
   npm start
   ```
   App sẽ chạy trên http://localhost:3000

4. **Đảm bảo MCP Server Python đang chạy:**
   Trong folder MCP SEVER, chạy:
   ```bash
   python3 server.py
   ```

## Sử dụng

- Nhập tin nhắn trong ô input
- Nhấn Enter hoặc nút "Gửi"
- Chatbot sẽ xử lý yêu cầu và có thể gửi email tự động

## Tùy chỉnh

- **Styles:** Chỉnh sửa `ChatBox.css` để thay đổi giao diện
- **Components:** Mở rộng hoặc chỉnh sửa các component trong `components/`
- **MCP Integration:** Cập nhật `server.js` để tích hợp đầy đủ với MCP protocol

## Công nghệ sử dụng

- React 19
- CSS thuần (không framework)
- Express.js (backend bridge)
- MCP SDK (@modelcontextprotocol/sdk)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

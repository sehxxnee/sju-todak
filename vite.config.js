import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(), // Tailwind 플러그인 추가
    ],
    server: {
        port: 5173, // 개발 서버 포트 5173으로 변경
        proxy: {
            '/calendar': 'http://localhost:3000', // NestJS 서버 포트로 맞추세요
        }
    },
});

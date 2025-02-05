 <h1 align="center">Hi 👋, I'm Mob</h1>
<h3 align="center">Join the Cryptocurrency Market, make money from Airdrop - Retroactive with me</h3>

- <p align="left"> <img src="https://komarev.com/ghpvc/?username=mobonchain&label=Profile%20views&color=0e75b6&style=flat" alt="mobonchain" /> <a href="https://github.com/mobonchain"> <img src="https://img.shields.io/github/followers/mobonchain?label=Follow&style=social" alt="Follow" /> </a> </p>

- [![TopAME | Bullish - Cheerful](https://img.shields.io/badge/TopAME%20|%20Bullish-Cheerful-blue?logo=telegram&style=flat)](https://t.me/xTopAME)

# Hướng dẫn cài đặt Auto Swap TeaFi ( WPOL → tPOL )

---

## Yêu cầu

1. Kết nối ví và tham gia **[TeaFi](http://app.tea-fi.com/?ref=btfi6z)**
2. **Swap** **POL → WPOL**, sau đó **Swap** **WPOL → tPOL** tối thiểu 1 lệnh và **Aprove** cho **WPOL** 
3. URL RPC mạng **Polygon**. Có thể đăng ký miễn phí URL RPC tại **[Alchemy](https://alchemy.com/)**.

### Hướng dẫn lấy URL RPC từ Alchemy

1. Truy cập vào trang web **[Alchemy](https://alchemy.com/)** và đăng ký tài khoản nếu bạn chưa có.
2. Đăng ký tài khoản Alchemy nếu bạn chưa có.
3. Tạo một dự án mới:
   - Nhấn vào **Create App**.
   - Điền thông tin như tên dự án và chọn mạng **Polygon**.
   - Nhấn **Create App**
4. Sau khi tạo dự án thành công, nhấn vào dự án vừa tạo để lấy URL RPC.
   - URL RPC sẽ có định dạng tương tự như: `https://<network>.alchemyapi.io/v2/<api-key>`.

---

## Cấu Trúc Dữ Liệu Trong File config,json
```
{
    "api_Url": "https://api.tea-fi.com/transaction",
    "pointsAmount": "https://api.tea-fi.com/points/",
    "accounts": [
        {
            "privateKey": "Your_Wallet_PrivateKey1",
            "rpc_url": "https://polygon-mainnet.g.alchemy.com/v2/API_KEY11",
            "proxy": "http://username:pass@host:port"
      },
      {
        "privateKey": "Your_Wallet_PrivateKey2",
        "rpc_url": "https://polygon-mainnet.g.alchemy.com/v2/API_KEY22",
        "proxy": "http://username:pass@host:port"
  },
  {
    "privateKey": "Your_Wallet_PrivateKey33",
    "rpc_url": "https://polygon-mainnet.g.alchemy.com/v2/API_KEY33",
    "proxy": "http://username:pass@host:port"
}
    ]
  }
```

---

## Cài Đặt Trên Windows

### Bước 1: Tải và Giải Nén File

1. Nhấn vào nút **<> Code"** màu xanh lá cây, sau đó chọn **Download ZIP**.
2. Giải nén file ZIP vào thư mục mà bạn muốn lưu trữ.

### Bước 2: Cấu Hình Private Key và RPC

1. Mở file config.json
2. Điền vào cấu trúc dữ liệu phía trên, thay bằng **Private Key**, **URL RPC Polygon** và **Proxy** đã chuẩn bị
3. Lưu file

### Bước 3: Cài Đặt Module

1. Mở **Command Prompt (CMD)** hoặc **PowerShell** trong thư mục chứa mã nguồn.
2. Cài đặt các module yêu cầu bằng lệnh:
   ```bash
   npm install
   ```

### Bước 4: Chạy Tool

1. Chạy chương trình bằng lệnh:
   ```bash
   node main.js
   ```
2. Tool sẽ bắt đầu xử lý tự động.

---

## Cài Đặt Trên Linux (VPS)

### Bước 1: Tạo Phiên `screen`

1. Đăng nhập vào VPS của bạn qua SSH.

2. Tạo một phiên `screen` mới để chạy công cụ **TeaFi** mà không bị gián đoạn khi bạn rời khỏi terminal:

   ```bash
   screen -S TeaFi
   ```

### Bước 2: Git Clone Dự Án

   ```bash
   git clone https://github.com/mobonchain/TeaFi.git
   cd TeaFi
   ```

### Bước 3: Cài Đặt Node.js và NPM

1. Kiểm tra xem Node.js và npm đã được cài đặt chưa:

   ```bash
   node -v
   npm -v
   ```

   Nếu chưa cài đặt, bạn có thể cài Node.js và npm bằng các lệnh sau (cho **Ubuntu/Debian**):

   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```

   Đối với các hệ điều hành khác, hãy tham khảo tài liệu chính thức của **[Node.js](https://nodejs.org/en/)**.

### Bước 4: Cài Đặt Các Module

1. Sau khi clone về, chạy lệnh sau để cài đặt các module yêu cầu:

   ```bash
   npm install
   ```

### Bước 5: Cấu Hình Private Key, RPC và Proxy

1. Mở file `config.json`.

   ```bash
   nano env
   ```
2. Thêm thông tin vào theo cấu trúc dữ liệu phía trên.
3. Lưu file bằng tổ hợp phím **Ctrl + O**, sau đó thoát bằng **Ctrl + X**.

### Bước 6: Chạy Ứng Dụng

1. Sau khi cài đặt xong các module và cấu hình, chạy ứng dụng bằng lệnh:

   ```bash
   node main.js
   ```

### Bước 8: Để Ứng Dụng Chạy Tiếp Tục Sau Khi Đăng Xuất

Khi bạn muốn để ứng dụng chạy trong nền và không bị gián đoạn khi đăng xuất khỏi phiên SSH, bạn có thể tách khỏi phiên `screen` bằng cách nhấn `Ctrl + A` rồi nhấn `D`.

Để quay lại phiên `screen` đã tạo, bạn chỉ cần chạy lệnh:

```bash
screen -r TeaFi
```

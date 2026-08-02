# Deploy lên GitHub Pages

Website được tự động deploy khi có thay đổi được push lên nhánh `main`.

## Thiết lập lần đầu

1. Mở repository `haotc2/LiveBackground` trên GitHub.
2. Vào **Settings → Pages**.
3. Trong **Build and deployment → Source**, chọn **GitHub Actions**.
4. Push code lên nhánh `main`, hoặc vào tab **Actions → Deploy GitHub Pages → Run workflow**.

Sau khi workflow hoàn tất, website dự kiến có địa chỉ:

`https://haotc2.github.io/LiveBackground/`

Workflow chỉ deploy `index.html`, `styles.css` và `script.js`. File video cũ trong `assets/` không được đóng gói vào website.

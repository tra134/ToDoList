# 📝 ToDoList (React + TypeScript)

App ToDoList học **TypeScript + React**: thêm/sửa/xoá task, lọc theo route,
đặt deadline theo **múi giờ của máy bạn** và nhắc trước hạn (trong app +
thông báo hệ thống). Giao diện **sáng/tối** (nền `back_ground_light.png` /
`back_ground_dark.png`) với chế độ **auto theo giờ** (18h–6h là tối), layout
**sidebar** gồm menu chính + **thống kê** (biểu đồ tròn + biểu đồ đường 7 ngày
vẽ bằng SVG thuần), **màu kí hiệu + ghi chú** cho từng task, **phân trang**
khi list dài. Dữ liệu lưu ở `localStorage`, không cần backend.

Xem đặc tả chi tiết từng phase trong [`plan.md`](./plan.md).

## Chạy

```bash
npm install
npm run dev        # chạy dev server
npm run test:run   # chạy toàn bộ test (140 test)
npm run test       # chạy test ở chế độ watch
npm run build      # build production (tsc + vite build)
npm run lint       # oxlint
```

## Tech stack

| Thành phần | Công cụ |
|---|---|
| Build | Vite 8 (template `react-ts`, TypeScript `strict`) |
| UI | React 18 (function component + hooks) |
| Style | CSS thuần (mỗi component 1 file `.css`) |
| Routing | react-router-dom v6 |
| Lưu trữ | `localStorage` |
| Thời gian | `Date` + `Intl` (không cần moment/dayjs) |
| Nhắc nhở | Notification API + banner trong app |
| Test | Vitest + React Testing Library + jsdom |

## Routes

| Route | Nội dung |
|---|---|
| `/` | **Hôm nay** — task cần làm trong ngày (quá hạn + đến hạn hôm nay + chưa xếp lịch) |
| `/tasks` | Tất cả task |
| `/active` | Task chưa xong |
| `/completed` | Task đã xong |
| `/overdue` | Task quá hạn và chưa xong |
| `*` | Trang 404 |

Tất cả route lồng trong layout chung: **sidebar** (menu + thống kê +
nút sáng/tối ở góc phải trên) + `ReminderToast`.

## Quy tắc múi giờ (quan trọng)

- **Lưu** deadline là epoch milliseconds (thời điểm tuyệt đối, UTC).
- **Hiển thị** bằng `Intl.DateTimeFormat` với timezone lấy từ trình duyệt.
- **Nhập** bằng `<input type="datetime-local">` — giá trị là giờ địa phương.
- App **không hard-code** múi giờ; chỉ test hard-code `TZ=Asia/Ho_Chi_Minh`
  trong `src/test/globalSetup.ts` để kết quả test ổn định trên mọi máy.

## Cấu trúc thư mục

```text
src/
├── types/       Task, Filter, ReminderAlert
├── constants/   STORAGE_KEY, TICK_MS, REMINDER_OPTIONS
├── utils/       hàm thuần: time, filterTasks, stats, normalizeTask, notify
├── hooks/       state + side-effect: useTasks, useLocalStorage, useNow, useReminders, useTheme
├── layouts/     AppLayout (sidebar + ReminderToast + Outlet)
├── components/  UI thuần (Sidebar, SidebarStats, ThemeToggle, Charts, TaskForm, TaskItem, ...)
├── pages/       TodayPage (trang chủ), TaskPage (dùng chung 4 route), NotFoundPage
└── test/        globalSetup (TZ), setup, factories, renderWithRouter
```

> Quy tắc: tầng trên import tầng dưới, **không import ngược**.

## Giới hạn cần biết

- Nhắc nhở **chỉ hoạt động khi tab đang mở**. Trình duyệt giảm tần suất timer
  khi tab chạy nền, nên code luôn so sánh với `Date.now()` thay vì đếm số tick.
- Nhắc khi đã đóng tab cần Service Worker + Push + server → ngoài phạm vi.
- Mỗi task chỉ nhắc **1 lần**; đổi deadline thì được nhắc lại.
- Mở app sau khi deadline đã qua: lần tick đầu sẽ nhắc 1 lần với trạng thái
  "đã quá hạn".

# 📝 PLAN: ToDoList (React + TypeScript)

> **Mục tiêu chính: học TypeScript + React**, không phải làm app phức tạp.
> Chỉ làm chức năng cơ bản, mỗi phase học 1–2 khái niệm mới, **viết test ngay sau mỗi phase**.

**Mục lục:**
[1. Tech stack](#1-tech-stack) ·
[2. Chức năng](#2-chức-năng) ·
[3. Quy tắc thời gian & múi giờ](#3-quy-tắc-thời-gian--múi-giờ) ·
[4. Routes](#4-routes) ·
[5. Cấu trúc thư mục](#5-cấu-trúc-thư-mục) ·
[6. Kiểu dữ liệu](#6-kiểu-dữ-liệu) ·
[7. Các phase](#7-kế-hoạch-thực-hiện-từng-phase) ·
[8. Kế hoạch test](#8-kế-hoạch-test) ·
[9. Checklist](#9-checklist-kiểm-tra-cuối-cùng) ·
[10. Khái niệm cần nắm](#10-khái-niệm-cần-nắm-sau-project) ·
[11. Mở rộng](#11-mở-rộng-không-bắt-buộc) ·
[12. Quy tắc làm việc](#12-quy-tắc-làm-việc)

---

## 1. Tech stack

| Thành phần | Công cụ | Ghi chú |
|---|---|---|
| Build tool | **Vite** (template `react-ts`) | Nhanh, setup đơn giản |
| Ngôn ngữ | **TypeScript** | Bật `strict: true` |
| UI | **React 18** (function component + hooks) | Không dùng class component |
| Style | **CSS thuần** (mỗi component 1 file `.css`) | Không dùng Tailwind/UI lib |
| Routing | **react-router-dom v6** | Học route cơ bản |
| Lưu trữ | **localStorage** | Không cần backend |
| Thời gian | **`Date` + `Intl`** (có sẵn trong trình duyệt) | Không cần cài moment/dayjs |
| Nhắc nhở | **Notification API** + banner trong app | Chỉ hoạt động khi tab đang mở |
| Test | **Vitest** + **React Testing Library** + **jsdom** | Cùng hệ sinh thái với Vite |

---

## 2. Chức năng

**Cơ bản**
- [ ] Thêm task mới
- [ ] Đánh dấu hoàn thành / bỏ hoàn thành (toggle)
- [ ] Xoá task
- [ ] Sửa tên task (double-click)
- [ ] Lọc bằng **route**: Tất cả / Đang làm / Đã xong / Quá hạn
- [ ] Đếm task còn lại và task quá hạn
- [ ] Lưu vào localStorage (F5 không mất)

**Deadline & nhắc nhở (mới)**
- [ ] Đặt deadline (ngày + giờ) khi thêm task, sửa được deadline sau đó
- [ ] Hiển thị deadline theo **múi giờ của vị trí hiện tại** (tự lấy từ trình duyệt)
- [ ] Hiện nhãn múi giờ rõ ràng (vd `Asia/Ho_Chi_Minh · GMT+7`)
- [ ] Badge trạng thái: bình thường (xám) / sắp tới hạn (vàng) / quá hạn (đỏ)
- [ ] Chọn thời điểm nhắc trước: không nhắc / 5 / 10 / 30 phút / 1 giờ / 1 ngày
- [ ] Nhắc bằng **banner trong app** (luôn có) + **thông báo hệ thống** (nếu user cho phép)
- [ ] Mỗi task chỉ nhắc **1 lần**; đổi deadline thì được nhắc lại

**Không làm** (để sau): đăng nhập, backend, push khi đóng tab, drag & drop, tag, dark mode.

---

## 3. Quy tắc thời gian & múi giờ

Đây là phần dễ sai nhất, nên chốt quy tắc trước khi code:

| # | Quy tắc | Lý do |
|---|---|---|
| 1 | **Lưu** deadline dưới dạng `number` = epoch milliseconds (UTC), ví dụ `Date.now()` | Là một thời điểm tuyệt đối, không phụ thuộc múi giờ |
| 2 | **Hiển thị** bằng `Intl.DateTimeFormat` với `timeZone` lấy từ trình duyệt | Tự khớp với vị trí hiện tại của người dùng |
| 3 | **Nhập** bằng `<input type="datetime-local">` (giá trị dạng `2026-10-25T14:00`, không có múi giờ) | `new Date("2026-10-25T14:00")` sẽ hiểu là **giờ địa phương** |
| 4 | **Không hard-code** múi giờ trong code app | Đổi vị trí/đổi múi giờ máy thì app tự theo |
| 5 | Chỉ hard-code múi giờ **trong test** (`globalSetup.ts`) | Để test cho kết quả giống nhau trên mọi máy |

**Cách lấy múi giờ hiện tại:**
```ts
Intl.DateTimeFormat().resolvedOptions().timeZone; // vd "Asia/Ho_Chi_Minh"
```

**Ví dụ:** người dùng ở Đà Nẵng (`Asia/Ho_Chi_Minh`, UTC+7, không có giờ mùa hè) chọn `14:00 ngày 25/10/2026` → lưu `Date.UTC(2026, 9, 25, 7, 0)`. Nếu sau này mở app ở múi giờ khác, **cùng thời điểm đó** sẽ tự hiển thị đúng giờ địa phương mới.

**Hàm cần có trong `utils/time.ts`:**

| Hàm | Việc làm |
|---|---|
| `getUserTimeZone(): string` | Trả về IANA timezone của trình duyệt |
| `getTimeZoneLabel(ts?: number): string` | `"Asia/Ho_Chi_Minh · GMT+7"` (dùng `timeZoneName: "short"`) |
| `formatDeadline(ts: number): string` | `Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone })` |
| `toInputValue(ts: number \| null): string` | Timestamp → `"YYYY-MM-DDTHH:mm"` giờ địa phương (dùng `getFullYear()`, `getHours()`... **không** dùng `toISOString()` vì nó ra UTC) |
| `fromInputValue(v: string): number \| null` | `""` → `null`; ngược lại `new Date(v).getTime()`, kiểm tra `NaN` |
| `isOverdue(task, now): boolean` | Có `dueAt`, chưa xong, `dueAt < now` |
| `isDueSoon(task, now): boolean` | Chưa quá hạn và `dueAt - now <= 24h` |
| `formatTimeLeft(dueAt, now): string` | Dùng `Intl.RelativeTimeFormat("vi")` → "còn 3 giờ" / "quá hạn 2 ngày" |

---

## 4. Routes

| Route | Component | Mô tả |
|---|---|---|
| `/` | `TaskPage filter="all"` | Tất cả task |
| `/active` | `TaskPage filter="active"` | Task chưa xong |
| `/completed` | `TaskPage filter="completed"` | Task đã xong |
| `/overdue` | `TaskPage filter="overdue"` | Task **quá hạn** và chưa xong |
| `*` | `NotFoundPage` | Đường dẫn không tồn tại |

> 4 route đầu dùng **chung 1 component** `TaskPage`, khác nhau ở prop `filter` (union type).
> **State và reminder sống ở `App.tsx`** (trên `<Routes>`), không đặt trong `TaskPage`, để chuyển route không làm mất banner nhắc và việc kiểm tra deadline không bị gián đoạn.

---

## 5. Cấu trúc thư mục

Chú thích: `[NEW]` = file thêm cho deadline/nhắc nhở · `[TEST]` = file test (đặt cạnh file được test).

```text
todolist/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                          # Entry point, bọc <BrowserRouter>
│   ├── App.tsx                           # Gọi useTasks/useReminders, khai báo <Routes>
│   ├── App.test.tsx                      # [TEST] Routing: /active, /overdue, 404
│   ├── index.css                         # CSS global: reset, biến màu, layout
│   │
│   ├── types/
│   │   └── task.ts                       # Task, Filter, ReminderAlert
│   │
│   ├── constants/
│   │   └── config.ts                     # [NEW] STORAGE_KEY, TICK_MS, REMINDER_OPTIONS
│   │
│   ├── utils/                            # Hàm thuần (pure), dễ test nhất
│   │   ├── filterTasks.ts                # Lọc theo all/active/completed/overdue
│   │   ├── filterTasks.test.ts           # [TEST]
│   │   ├── normalizeTask.ts              # [NEW] Điền mặc định cho task cũ trong localStorage
│   │   ├── normalizeTask.test.ts         # [TEST]
│   │   ├── time.ts                       # [NEW] Múi giờ, format, đổi input <-> timestamp, isOverdue
│   │   ├── time.test.ts                  # [TEST]
│   │   ├── notify.ts                     # [NEW] Bọc Notification API (xin quyền, gửi thông báo)
│   │   └── notify.test.ts                # [TEST]
│   │
│   ├── hooks/                            # Logic có state / side-effect
│   │   ├── useLocalStorage.ts            # Generic <T>, đọc/ghi localStorage
│   │   ├── useLocalStorage.test.ts       # [TEST]
│   │   ├── useTasks.ts                   # add/toggle/delete/edit/setDeadline/markReminded
│   │   ├── useTasks.test.ts              # [TEST]
│   │   ├── useNow.ts                     # [NEW] Trả về Date.now() cập nhật mỗi TICK_MS
│   │   ├── useReminders.ts               # [NEW] Phát hiện task tới hạn nhắc -> alert + notification
│   │   └── useReminders.test.ts          # [TEST]
│   │
│   ├── components/                       # UI, nhận props, ít logic
│   │   ├── TaskForm/                     # Ô nhập tên + DeadlinePicker + nút Add
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskForm.css
│   │   │   └── TaskForm.test.tsx         # [TEST]
│   │   ├── TaskItem/                     # 1 dòng task: checkbox, tên, badge, sửa, xoá
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskItem.css
│   │   │   └── TaskItem.test.tsx         # [TEST]
│   │   ├── TaskList/
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskList.css
│   │   ├── DeadlinePicker/               # [NEW] <input datetime-local> + nhãn múi giờ + chọn nhắc trước
│   │   │   ├── DeadlinePicker.tsx
│   │   │   ├── DeadlinePicker.css
│   │   │   └── DeadlinePicker.test.tsx   # [TEST]
│   │   ├── DeadlineBadge/                # [NEW] Hiện hạn + còn/quá hạn bao lâu (xám/vàng/đỏ)
│   │   │   ├── DeadlineBadge.tsx
│   │   │   ├── DeadlineBadge.css
│   │   │   └── DeadlineBadge.test.tsx    # [TEST]
│   │   ├── ReminderToast/                # [NEW] Banner nhắc trong app (luôn hiện, kể cả khi bị chặn thông báo)
│   │   │   ├── ReminderToast.tsx
│   │   │   ├── ReminderToast.css
│   │   │   └── ReminderToast.test.tsx    # [TEST]
│   │   ├── NotificationButton/           # [NEW] Nút 'Bật thông báo' (xin quyền khi user bấm)
│   │   │   ├── NotificationButton.tsx
│   │   │   └── NotificationButton.css
│   │   ├── FilterNav/                    # 4 link: All / Active / Completed / Overdue
│   │   │   ├── FilterNav.tsx
│   │   │   ├── FilterNav.css
│   │   │   └── FilterNav.test.tsx        # [TEST]
│   │   └── Footer/                       # 'X task còn lại · Y quá hạn'
│   │       ├── Footer.tsx
│   │       └── Footer.css
│   │
│   ├── pages/                            # Ghép component thành màn hình
│   │   ├── TaskPage.tsx                  # Dùng chung cho 4 route, nhận prop filter
│   │   ├── TaskPage.test.tsx             # [TEST] Integration: thêm task + deadline + lọc
│   │   └── NotFoundPage.tsx
│   │
│   └── test/                             # Hạ tầng dùng chung cho test
│       ├── globalSetup.ts                # Ép TZ=Asia/Ho_Chi_Minh để test ổn định
│       ├── setup.ts                      # Nạp jest-dom matchers
│       ├── factories.ts                  # makeTask(overrides) tạo task giả
│       └── renderWithRouter.tsx          # render() bọc sẵn MemoryRouter
│
├── .gitignore
├── index.html
├── package.json                          # Scripts: dev, build, test, test:run
├── tsconfig.json                         # strict: true, types: vitest/globals
├── vite.config.ts                        # Cấu hình Vite + Vitest (jsdom, setupFiles)
└── plan.md
```

### Kiến trúc phân tầng

```text
pages/        ghép component thành màn hình
   │
   ▼
components/   UI thuần, nhận props, gọi callback
   │
   ▼
hooks/        state + side-effect (localStorage, timer, notification)
   │
   ▼
utils/        hàm thuần: lọc, format, tính toán thời gian
   │
   ▼
types/ · constants/   nền tảng, không import gì từ các tầng trên
```

> **Quy tắc:** tầng trên được import tầng dưới, **không import ngược lại**.
> Ví dụ `utils/time.ts` không được import từ `components/`.

### Quy ước đặt tên

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | `PascalCase`, mỗi component 1 thư mục | `TaskItem/TaskItem.tsx` |
| Hook | bắt đầu bằng `use` | `useReminders.ts` |
| Hàm/util | `camelCase` | `filterTasks.ts` |
| Test | `<tên file>.test.ts(x)` đặt cạnh file gốc | `time.test.ts` |
| Hằng số | `UPPER_SNAKE_CASE` | `TICK_MS` |

---

## 6. Kiểu dữ liệu

`types/task.ts`
```ts
export interface Task {
  id: string;               // crypto.randomUUID()
  title: string;
  completed: boolean;
  createdAt: number;        // epoch ms (UTC)
  dueAt: number | null;     // epoch ms (UTC); null = không có deadline
  remindBeforeMin: number;  // 0 = không nhắc
  reminded: boolean;        // đã nhắc rồi thì không nhắc lại
}

export type Filter = "all" | "active" | "completed" | "overdue";

export interface ReminderAlert {
  taskId: string;
  title: string;
  overdue: boolean;         // true: đã quá hạn, false: sắp tới hạn
}
```

`constants/config.ts`
```ts
export const STORAGE_KEY = "todolist.tasks";
export const TICK_MS = 30_000; // kiểm tra deadline mỗi 30 giây
export const REMINDER_OPTIONS = [0, 5, 10, 30, 60, 1440] as const;
export type ReminderOption = (typeof REMINDER_OPTIONS)[number];
```

---

## 7. Kế hoạch thực hiện từng phase

### Phase 0 — Setup (≈ 45 phút)
**Việc cần làm:**
1. `npm create vite@latest todolist -- --template react-ts`
2. `cd todolist && npm install`
3. `npm install react-router-dom`
4. `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
5. Sửa `vite.config.ts`:
   ```ts
   /// <reference types="vitest/config" />
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: "jsdom",
       globals: true,
       globalSetup: "./src/test/globalSetup.ts",
       setupFiles: "./src/test/setup.ts",
       css: false,
     },
   });
   ```
6. Tạo `src/test/globalSetup.ts`:
   ```ts
   export function setup() {
     process.env.TZ = "Asia/Ho_Chi_Minh"; // chỉ dùng cho test
   }
   ```
7. Tạo `src/test/setup.ts`: `import "@testing-library/jest-dom/vitest";`
8. Trong `tsconfig` thêm `"types": ["vitest/globals"]`
9. Thêm vào `package.json`: `"test": "vitest"`, `"test:run": "vitest run"`
10. Xoá file demo (`App.css`, logo...), tạo sẵn thư mục theo tree ở mục 5
11. Viết 1 test thử `expect(1 + 1).toBe(2)` → `npm run test:run` phải xanh

**Học được:** cấu trúc project Vite, `tsconfig`, `strict` mode, chạy test lần đầu.

---

### Phase 1 — Types + Component tĩnh (≈ 1–2 giờ)
**Việc cần làm:**
1. Viết `types/task.ts` (mục 6)
2. Viết `TaskItem.tsx` với props có type:
   ```ts
   interface TaskItemProps {
     task: Task;
     now: number;
     onToggle: (id: string) => void;
     onDelete: (id: string) => void;
     onEdit: (id: string, newTitle: string) => void;
   }
   ```
3. Viết `TaskList.tsx` nhận `tasks: Task[]`, `.map()` ra `TaskItem` (nhớ `key`)
4. Hard-code vài task mẫu trong `App.tsx` để xem giao diện
5. CSS cơ bản cho `TaskItem`, `TaskList` (flexbox)
6. Viết `test/factories.ts`: `makeTask(overrides?: Partial<Task>): Task`

**Học được:** `interface`, props typing, `.map()` + `key`, function type, `Partial<T>`.

---

### Phase 2 — State + Thêm/Toggle/Xoá (≈ 2 giờ)
**Việc cần làm:**
1. Trong `App.tsx` (tạm thời) dùng `useState<Task[]>([])`
2. Viết `TaskForm.tsx`: `useState<string>("")` cho input, `onSubmit` gọi `onAdd(title)` rồi clear; không cho thêm nếu `title.trim()` rỗng
3. Viết `addTask`, `toggleTask`, `deleteTask` bằng `map`/`filter` (**không mutate** state)
4. Truyền hàm xuống `TaskList` → `TaskItem`
5. **Test `TaskForm.test.tsx`:** gõ chữ + Enter → gọi `onAdd` đúng 1 lần với đúng title; để trống → không gọi `onAdd`

**Học được:** `useState<T>`, event typing (`React.FormEvent<HTMLFormElement>`, `React.ChangeEvent<HTMLInputElement>`), immutable update, `render` / `screen` / `userEvent`, `vi.fn()`.

---

### Phase 3 — Tách logic ra custom hook (≈ 1–2 giờ)
**Việc cần làm:**
1. Tạo `hooks/useTasks.ts`, chuyển state + các hàm vào
2. Ghi **return type** rõ ràng cho hook
3. `App.tsx` chỉ gọi `const taskApi = useTasks()`
4. **Test `useTasks.test.ts`** dùng `renderHook` + `act`: add → length tăng; toggle → `completed` đổi; delete → mất task; edit → title đổi

**Học được:** custom hook, tách logic khỏi UI, `renderHook`, `act`.

---

### Phase 4 — Lưu localStorage (≈ 1–2 giờ)
**Việc cần làm:**
1. `constants/config.ts`: thêm `STORAGE_KEY`
2. `hooks/useLocalStorage.ts` dạng **generic**:
   ```ts
   function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void]
   ```
   - Đọc lúc khởi tạo bằng lazy initializer `useState(() => ...)` + `JSON.parse` trong `try/catch`
   - Ghi lại bằng `useEffect` khi value đổi
3. `useTasks` dùng `useLocalStorage<Task[]>(STORAGE_KEY, [])`
4. **Test `useLocalStorage.test.ts`:** đọc được giá trị có sẵn; JSON hỏng → trả về `initial` (không crash); set → `localStorage.getItem` có dữ liệu. Nhớ `localStorage.clear()` trong `beforeEach`.

**Học được:** generics `<T>`, `useEffect`, dependency array, `try/catch`, `beforeEach`.

---

### Phase 5 — Routing + Filter (≈ 2 giờ)
**Việc cần làm:**
1. `main.tsx`: bọc `<App />` bằng `<BrowserRouter>`
2. `App.tsx` khai báo:
   ```tsx
   <Routes>
     <Route path="/" element={<TaskPage filter="all" {...taskApi} />} />
     <Route path="/active" element={<TaskPage filter="active" {...taskApi} />} />
     <Route path="/completed" element={<TaskPage filter="completed" {...taskApi} />} />
     <Route path="/overdue" element={<TaskPage filter="overdue" {...taskApi} />} />
     <Route path="*" element={<NotFoundPage />} />
   </Routes>
   ```
3. `utils/filterTasks.ts`: `filterTasks(tasks: Task[], filter: Filter, now: number): Task[]` (dùng `switch` + kiểm tra đủ nhánh)
4. `FilterNav.tsx` dùng `<NavLink>` (tự có class `active`; link `/` cần prop `end`)
5. `TaskPage.tsx` ghép `TaskForm` + `FilterNav` + `TaskList` + `Footer`
6. `NotFoundPage.tsx` có link về `/`
7. **Test:**
   - `filterTasks.test.ts`: mỗi filter 1 case, thêm case `overdue` không lấy task đã xong và task không có deadline
   - `FilterNav.test.tsx`: bọc `MemoryRouter`, link đúng `href`, link đang ở route hiện tại có class `active`
   - `App.test.tsx`: vào `/abc` → thấy trang 404

**Học được:** `Routes`, `Route`, `NavLink`, `MemoryRouter`, union type, `switch` exhaustive, `renderWithRouter`.

---

### Phase 6 — Sửa task + Footer (≈ 1–2 giờ)
**Việc cần làm:**
1. `TaskItem.tsx`: state `isEditing`, `editText`; double-click vào tên → hiện `<input>`; `Enter` lưu, `Escape` huỷ (`React.KeyboardEvent<HTMLInputElement>`)
2. `editTask` không cho lưu title rỗng
3. `Footer.tsx` nhận `remaining: number`, `overdue: number`
4. **Test `TaskItem.test.tsx`:** click checkbox → `onToggle(id)`; click xoá → `onDelete(id)`; double-click → sửa → Enter → `onEdit(id, "mới")`; Escape → không gọi `onEdit`

**Học được:** conditional rendering, keyboard event, `userEvent.dblClick`, `userEvent.keyboard`.

---

### Phase 7 — Deadline + múi giờ (≈ 3 giờ)
**Việc cần làm:**
1. Mở rộng `Task` (mục 6) và **`utils/normalizeTask.ts`**: nhận `unknown`/object cũ, trả về `Task` đủ field (`dueAt ?? null`, `remindBeforeMin ?? 0`, `reminded ?? false`) → task đã lưu từ phase 4 không bị lỗi. `useTasks` gọi `.map(normalizeTask)` khi đọc dữ liệu.
2. Viết `utils/time.ts` đủ các hàm ở **mục 3**
3. `DeadlinePicker.tsx`:
   - `<input type="datetime-local">` với `min={toInputValue(Date.now())}`
   - Hiện nhãn `getTimeZoneLabel()` ngay dưới input
   - `<select>` "Nhắc trước" render từ `REMINDER_OPTIONS`
   - Props: `value: number | null`, `remindBeforeMin: number`, `onChange(dueAt, remindBeforeMin)`
4. `TaskForm.tsx` nhúng `DeadlinePicker`; `addTask(title, dueAt, remindBeforeMin)`
5. `DeadlineBadge.tsx`: nhận `task`, `now` → hiện `formatDeadline` + `formatTimeLeft`; class `badge--overdue` (đỏ) / `badge--soon` (vàng) / mặc định (xám); task đã xong thì không tô đỏ
6. `TaskItem` hiển thị `DeadlineBadge`; thêm nút sửa deadline (mở lại `DeadlinePicker`); `setDeadline(id, dueAt, remindBeforeMin)` trong `useTasks` phải **đặt `reminded = false`**
7. `Footer` đếm số task quá hạn
8. **Test:**
   - `time.test.ts` (viết **trước** khi code hàm — thử TDD): xem bảng mục 8
   - `normalizeTask.test.ts`: object cũ thiếu field → có đủ giá trị mặc định
   - `DeadlinePicker.test.tsx`: chọn ngày giờ → `onChange` nhận đúng timestamp; xoá input → `null`; có hiện nhãn múi giờ
   - `DeadlineBadge.test.tsx`: 3 trạng thái đúng class; task xong không đỏ

**Học được:** `number | null` và `??`, `as const` + `typeof`, `Date` / `Intl`, controlled input, TDD cơ bản.

---

### Phase 8 — Nhắc deadline (≈ 3 giờ)
**Việc cần làm:**
1. `utils/notify.ts`:
   ```ts
   isNotificationSupported(): boolean
   getPermission(): NotificationPermission | "unsupported"
   requestPermission(): Promise<NotificationPermission | "unsupported">
   sendNotification(title: string, body: string): boolean // false nếu không gửi được
   ```
   Luôn kiểm tra `"Notification" in window` trước khi dùng.
2. `hooks/useNow.ts`: `useState(Date.now())` + `setInterval` mỗi `TICK_MS`, **nhớ `clearInterval` trong cleanup**
3. `hooks/useReminders.ts`:
   ```ts
   function useReminders(
     tasks: Task[],
     now: number,
     markReminded: (id: string) => void,
   ): { alerts: ReminderAlert[]; dismiss: (taskId: string) => void }
   ```
   Điều kiện nhắc một task:
   `!completed && dueAt !== null && !reminded && now >= dueAt - remindBeforeMin * 60_000 && remindBeforeMin > 0`
   Khi thoả: thêm `ReminderAlert` (đặt `overdue = now >= dueAt`), gọi `sendNotification`, gọi `markReminded(id)`.
4. `ReminderToast.tsx`: hiện danh sách `alerts`, mỗi cái có nút đóng; màu đỏ nếu `overdue`
5. `NotificationButton.tsx`: chỉ hiện khi quyền là `"default"`; bấm mới gọi `requestPermission()` (trình duyệt **yêu cầu phải do user bấm**); nếu `"denied"` thì hiện dòng "Thông báo hệ thống đang bị chặn, vẫn nhắc trong app"
6. `App.tsx`: `const now = useNow(); const { alerts, dismiss } = useReminders(taskApi.tasks, now, taskApi.markReminded);` rồi render `<NotificationButton />` + `<ReminderToast />` phía trên `<Routes>`; truyền `now` xuống `TaskPage`
7. **Test:**
   - `notify.test.ts`: dùng `vi.stubGlobal("Notification", ...)` — xem bảng mục 8
   - `useReminders.test.ts`: dùng `vi.useFakeTimers()` + `vi.setSystemTime(...)` — xem bảng mục 8
   - `ReminderToast.test.tsx`: render đủ alert; bấm đóng → gọi `dismiss(taskId)`; alert quá hạn có class đỏ

**Giới hạn cần biết (ghi vào README nếu muốn):**
- Nhắc chỉ hoạt động khi **tab đang mở**. Tab chạy nền bị trình duyệt giảm tần suất timer, nên luôn so sánh với `Date.now()` thay vì đếm số lần tick.
- Nhắc khi đã đóng tab cần Service Worker + Push + server → ngoài phạm vi project này.
- Mở app sau khi deadline đã qua: lần tick đầu tiên sẽ nhắc 1 lần với trạng thái "đã quá hạn".

**Học được:** `useEffect` + cleanup, `setInterval`, Notification API, fake timers, `vi.stubGlobal`, side-effect trong hook.

---

### Phase 9 — Hoàn thiện (≈ 2 giờ)
**Việc cần làm:**
1. `index.css`: reset (`box-sizing`), biến màu `:root { --danger; --warning; --muted; ... }`, căn giữa app (`max-width: 560px; margin: 0 auto`)
2. Task đã xong: gạch ngang + màu xám
3. Hover cho nút, focus rõ cho input (cả bàn phím), style link `.active` ở `FilterNav`
4. Viết `TaskPage.test.tsx` (integration): seed localStorage → render → thêm task có deadline → thấy badge; vào `/overdue` chỉ thấy task quá hạn
5. `npm run test:run` → tất cả xanh
6. `npm run build` → **không có lỗi TypeScript**
7. Tìm trong code: không còn `any`, `@ts-ignore`

---

## 8. Kế hoạch test

**Công cụ & khái niệm:** `describe` / `it` / `expect`, mẫu **Arrange – Act – Assert**, `vi.fn()`, `vi.useFakeTimers()`, `vi.stubGlobal()`, `renderHook`, `render`, `screen`, `userEvent`.

**Thứ tự học đề xuất (dễ → khó):** `utils` (hàm thuần) → `hooks` → `components` → `pages` (integration).

| File test | Các case cần viết |
|---|---|
| `time.test.ts` | `getUserTimeZone()` = `"Asia/Ho_Chi_Minh"` (nhờ `globalSetup`) · `fromInputValue("2026-10-25T14:00")` = `Date.UTC(2026, 9, 25, 7, 0)` · `fromInputValue("")` = `null` · `toInputValue(fromInputValue(x))` = `x` (round-trip) · `formatDeadline` chứa `"14:00"` · `isOverdue`: quá hạn → true, đã xong → false, `dueAt = null` → false · `isDueSoon`: còn 2 giờ → true, còn 3 ngày → false · `formatTimeLeft` ra "còn…" / "quá hạn…" |
| `normalizeTask.test.ts` | Task cũ thiếu field → có `dueAt: null`, `remindBeforeMin: 0`, `reminded: false` · Task đủ field → giữ nguyên |
| `filterTasks.test.ts` | Mỗi filter 1 case · `overdue` loại task đã xong và task không deadline · danh sách rỗng → rỗng |
| `notify.test.ts` | Không có `Notification` → `sendNotification` trả `false`, không throw · Quyền `granted` → tạo `Notification` đúng title/body · Quyền `denied` → trả `false` · `requestPermission` được gọi và trả kết quả |
| `useLocalStorage.test.ts` | Đọc giá trị có sẵn · JSON hỏng → `initial` · Set → ghi vào localStorage |
| `useTasks.test.ts` | add · toggle · delete · edit · `setDeadline` đặt lại `reminded = false` · `markReminded` đặt `true` |
| `useReminders.test.ts` | Chưa tới mốc nhắc → `alerts` rỗng, không gọi `markReminded` · Tới mốc → 1 alert + `markReminded` 1 lần + gửi notification · Task đã `reminded` → không nhắc lại · Task đã `completed` → không nhắc · `remindBeforeMin = 0` → không nhắc · Quyền `denied` → vẫn có alert trong app · `dismiss` bỏ alert khỏi danh sách |
| `TaskForm.test.tsx` | Thêm task hợp lệ · Title rỗng không thêm · Có chọn deadline → `onAdd` nhận `dueAt` đúng |
| `TaskItem.test.tsx` | Toggle · Xoá · Sửa bằng double-click + Enter · Escape huỷ · Có hiện `DeadlineBadge` khi có `dueAt` |
| `DeadlinePicker.test.tsx` | Chọn giờ → `onChange` đúng timestamp · Xoá → `null` · Hiện nhãn múi giờ · `<select>` có đủ lựa chọn |
| `DeadlineBadge.test.tsx` | Xám / vàng / đỏ đúng điều kiện · Task đã xong không đỏ |
| `ReminderToast.test.tsx` | Render đủ alert · Đóng → `dismiss(taskId)` · Class đỏ khi `overdue` |
| `FilterNav.test.tsx` | Đủ 4 link đúng `href` · Link của route hiện tại có class `active` |
| `App.test.tsx` | `/abc` → 404 · `/overdue` render được |
| `TaskPage.test.tsx` | Thêm task có deadline → thấy badge · `/overdue` chỉ hiện task quá hạn · F5 giả lập (render lại) vẫn còn dữ liệu |

**Mẹo:**
- Mỗi test phải **độc lập**: `localStorage.clear()` và `vi.useRealTimers()` trong `beforeEach`/`afterEach`.
- Query theo cách người dùng thấy: `getByRole`, `getByLabelText`, `getByText` — hạn chế `getByTestId`.
- Test hành vi ("bấm nút thì thấy gì"), không test chi tiết cài đặt.

---

## 9. Checklist kiểm tra cuối cùng

**Cơ bản**
- [ ] Thêm task → xuất hiện ngay; task rỗng không thể thêm
- [ ] Toggle hoàn thành → gạch ngang
- [ ] Xoá task hoạt động
- [ ] Sửa task: double-click, Enter lưu, Escape huỷ
- [ ] `/active`, `/completed`, `/overdue` lọc đúng
- [ ] URL bậy (vd `/abc`) → NotFoundPage
- [ ] F5 không mất dữ liệu

**Deadline & nhắc**
- [ ] Nhãn múi giờ hiển thị đúng với máy của bạn
- [ ] Đặt deadline 10:00 → badge hiển thị đúng 10:00 (giờ địa phương)
- [ ] Thử đổi múi giờ hệ điều hành → giờ hiển thị đổi theo, thời điểm tuyệt đối không đổi
- [ ] Task quá hạn có badge đỏ; task đã xong thì không đỏ
- [ ] Đặt deadline sau 2 phút, nhắc trước 0 → không nhắc; nhắc trước 5 phút → nhắc ngay ở lần tick kế tiếp
- [ ] Banner nhắc hiện kể cả khi chặn thông báo hệ thống
- [ ] Mỗi task chỉ nhắc 1 lần; đổi deadline thì nhắc lại được
- [ ] Task cũ (chưa có deadline) từ localStorage không gây lỗi

**Chất lượng**
- [ ] `npm run test:run` xanh toàn bộ
- [ ] `npm run build` không lỗi, không có `any`

---

## 10. Khái niệm cần nắm sau project

| Khái niệm | Dùng ở đâu |
|---|---|
| `interface` / `type` | `Task`, `TaskItemProps`, `ReminderAlert` |
| Union type | `Filter = "all" \| "active" \| "completed" \| "overdue"` |
| `number \| null`, `??`, `?.` | `dueAt`, `normalizeTask` |
| `as const` + `typeof` | `REMINDER_OPTIONS` → `ReminderOption` |
| `Partial<T>` | `makeTask(overrides)` |
| Function type | `onToggle`, `markReminded`... |
| Generic `<T>` | `useState<Task[]>`, `useLocalStorage<T>` |
| Event typing | Form, input, keyboard event |
| Return type | `useTasks`, `useReminders`, `filterTasks` |
| Exhaustive `switch` | `filterTasks` |
| `strict` mode & null check | localStorage, `Notification` có thể không tồn tại |
| `Date` / `Intl` / timezone | `utils/time.ts` |
| `useEffect` + cleanup | `useNow`, `useLocalStorage` |
| Lifting state up | `useTasks` đặt ở `App.tsx` |
| Unit / hook / component / integration test | Mục 8 |
| Fake timers & mock global | `useReminders.test.ts`, `notify.test.ts` |

---

## 11. Mở rộng (không bắt buộc)

1. Nút "Clear completed"
2. Sắp xếp task theo deadline gần nhất
3. Chuyển state sang `useReducer` hoặc Context API
4. Cho chọn múi giờ thủ công (dropdown) thay vì tự lấy từ trình duyệt
5. Nhắc lặp lại mỗi X phút khi đã quá hạn
6. Báo cáo coverage: `@vitest/coverage-v8`
7. Test E2E với Playwright
8. Deploy lên Vercel / Netlify
9. PWA + Service Worker để nhắc cả khi đóng tab

---

## 12. Quy tắc làm việc

1. Làm **xong 1 phase (kể cả test)** mới sang phase tiếp theo.
2. Gặp lỗi TypeScript → **đọc kỹ message**, không sửa bằng `any` hay `@ts-ignore`.
3. Commit git sau mỗi phase (`git commit -m "phase 7: deadline + timezone"`).
4. Tự gõ code, không copy-paste nguyên khối — mục tiêu là học.
5. Test fail → sửa **code hoặc test cho đúng**, không xoá test để cho xanh.
6. Không hard-code múi giờ trong code app; chỉ hard-code trong `globalSetup.ts`.

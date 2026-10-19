import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("hiện 'Trang x/y' và nút Trước bị tắt ở trang đầu", () => {
    render(<Pagination page={0} pageCount={3} onChange={vi.fn()} />);

    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← Trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sau →" })).toBeEnabled();
  });

  it("bấm 'Sau' -> onChange(page + 1)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={0} pageCount={3} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Sau →" }));

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("ở trang cuối -> nút Sau bị tắt, bấm Trước -> onChange(page - 1)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={2} pageCount={3} onChange={onChange} />);

    expect(screen.getByText("Trang 3 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sau →" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "← Trước" }));

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("chỉ 1 trang -> không render phân trang", () => {
    const { container } = render(<Pagination page={0} pageCount={1} onChange={vi.fn()} />);

    expect(container.querySelector(".pagination")).toBeNull();
  });
});

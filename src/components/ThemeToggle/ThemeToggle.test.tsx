import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("render nút nắng/trăng + nút auto (auto đang bật)", () => {
    render(
      <ThemeToggle
        theme="light"
        mode="auto"
        onToggle={() => {}}
        onSetMode={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Chuyển sang giao diện tối" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tự đổi giao diện theo giờ" }),
    ).toHaveAttribute("aria-pressed", "true");
    // Hai icon: mặt trời + mặt trăng
    expect(document.querySelectorAll(".theme-toggle__opt")).toHaveLength(2);
  });

  it("giao diện tối -> label đổi thành 'Chuyển sang giao diện sáng'", () => {
    render(
      <ThemeToggle
        theme="dark"
        mode="dark"
        onToggle={() => {}}
        onSetMode={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Chuyển sang giao diện sáng" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tự đổi giao diện theo giờ" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("bấm pill gọi onToggle, bấm auto gọi onSetMode('auto')", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onSetMode = vi.fn();

    render(
      <ThemeToggle
        theme="light"
        mode="light"
        onToggle={onToggle}
        onSetMode={onSetMode}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Chuyển sang giao diện tối" }),
    );
    expect(onToggle).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole("button", { name: "Tự đổi giao diện theo giờ" }),
    );
    expect(onSetMode).toHaveBeenCalledWith("auto");
  });
});

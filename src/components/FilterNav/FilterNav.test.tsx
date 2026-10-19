import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "../../test/renderWithRouter";
import { FilterNav } from "./FilterNav";

describe("FilterNav", () => {
  it("đủ 4 link với href đúng", () => {
    renderWithRouter(<FilterNav />);

    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Tất cả" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Đang làm" })).toHaveAttribute(
      "href",
      "/active",
    );
    expect(screen.getByRole("link", { name: "Đã xong" })).toHaveAttribute(
      "href",
      "/completed",
    );
    expect(screen.getByRole("link", { name: "Quá hạn" })).toHaveAttribute(
      "href",
      "/overdue",
    );
  });

  it("route hiện tại có class active", () => {
    renderWithRouter(<FilterNav />, "/");

    expect(screen.getByRole("link", { name: "Tất cả" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Đang làm" })).not.toHaveClass("active");
  });

  it("route /overdue -> chỉ link 'Quá hạn' active", () => {
    renderWithRouter(<FilterNav />, "/overdue");

    expect(screen.getByRole("link", { name: "Quá hạn" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Tất cả" })).not.toHaveClass("active");
    expect(screen.getByRole("link", { name: "Đang làm" })).not.toHaveClass("active");
    expect(screen.getByRole("link", { name: "Đã xong" })).not.toHaveClass("active");
  });
});

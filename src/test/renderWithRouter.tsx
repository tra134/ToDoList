import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";

/** render() bọc sẵn MemoryRouter — dùng cho test cần react-router. */
export function renderWithRouter(ui: ReactElement, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>,
  );
}

export type RenderWithRouterResult = ReturnType<typeof renderWithRouter>;

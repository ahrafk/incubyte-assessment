import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  it("calls action when matching key is pressed", () => {
    const action = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "e", description: "Go to employees", action }])
    );
    fireEvent.keyDown(document, { key: "e" });
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("does not call action when a different key is pressed", () => {
    const action = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "e", description: "Go to employees", action }])
    );
    fireEvent.keyDown(document, { key: "i" });
    expect(action).not.toHaveBeenCalled();
  });

  it("ignores events from input elements", () => {
    const action = jest.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "e", description: "Go to employees", action }])
    );
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "e", target: input });
    expect(action).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("removes the event listener on unmount", () => {
    const action = jest.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: "e", description: "Go to employees", action }])
    );
    unmount();
    fireEvent.keyDown(document, { key: "e" });
    expect(action).not.toHaveBeenCalled();
  });
});

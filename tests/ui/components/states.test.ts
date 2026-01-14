import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import LoadingSpinner from "@/ui/components/LoadingSpinner.vue";
import ErrorState from "@/ui/components/ErrorState.vue";
import ErrorToast from "@/ui/components/ErrorToast.vue";
import EmptyState from "@/ui/components/EmptyState.vue";

describe("LoadingSpinner", () => {
  it("displays loading message", () => {
    const wrapper = mount(LoadingSpinner);

    expect(wrapper.text()).toContain("Loading");
  });
});

describe("ErrorState", () => {
  it("displays error message", () => {
    const wrapper = mount(ErrorState, {
      props: {
        message: "Network error occurred",
      },
    });

    expect(wrapper.text()).toContain("Network error occurred");
  });
});

describe("ErrorToast", () => {
  it("displays error message", () => {
    const wrapper = mount(ErrorToast, {
      props: {
        message: "Something went wrong",
      },
    });

    expect(wrapper.text()).toContain("Something went wrong");
  });

  it("displays retry and choose station buttons", () => {
    const wrapper = mount(ErrorToast, {
      props: {
        message: "Error",
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toContain("Try again");
    expect(buttons[1].text()).toContain("Choose station");
  });

  it("emits retry event when button clicked", async () => {
    const wrapper = mount(ErrorToast, {
      props: {
        message: "Error",
      },
    });

    await wrapper.find(".retry-button").trigger("click");

    expect(wrapper.emitted("retry")).toBeTruthy();
  });

  it("emits choose-station event when button clicked", async () => {
    const wrapper = mount(ErrorToast, {
      props: {
        message: "Error",
      },
    });

    await wrapper.find(".choose-button").trigger("click");

    expect(wrapper.emitted("choose-station")).toBeTruthy();
  });
});

describe("EmptyState", () => {
  it("displays station name in message", () => {
    const wrapper = mount(EmptyState, {
      props: {
        stationName: "Zurich Fluntern",
      },
    });

    expect(wrapper.text()).toContain("Zurich Fluntern");
    expect(wrapper.text()).toContain("No data available");
  });

  it("emits choose-station when button clicked", async () => {
    const wrapper = mount(EmptyState, {
      props: {
        stationName: "Zurich Fluntern",
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("choose-station")).toBeTruthy();
  });
});

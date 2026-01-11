import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CurrentReading from "@/ui/components/CurrentReading.vue";

describe("CurrentReading", () => {
  it("displays temperature", () => {
    const wrapper = mount(CurrentReading, {
      props: {
        temperature: "12°C",
        sunshine: "80%",
        precipitation: "0mm",
      },
    });

    expect(wrapper.text()).toContain("12°C");
  });

  it("displays sunshine percentage", () => {
    const wrapper = mount(CurrentReading, {
      props: {
        temperature: "12°C",
        sunshine: "80%",
        precipitation: "0mm",
      },
    });

    expect(wrapper.text()).toContain("80%");
  });

  it("displays precipitation", () => {
    const wrapper = mount(CurrentReading, {
      props: {
        temperature: "12°C",
        sunshine: "80%",
        precipitation: "2.5mm",
      },
    });

    expect(wrapper.text()).toContain("2.5mm");
  });

  it("displays dash for missing values", () => {
    const wrapper = mount(CurrentReading, {
      props: {
        temperature: "—",
        sunshine: "—",
        precipitation: "—",
      },
    });

    const text = wrapper.text();
    expect(text.match(/—/g)?.length).toBe(3);
  });

  it("displays weather icons", () => {
    const wrapper = mount(CurrentReading, {
      props: {
        temperature: "12°C",
        sunshine: "80%",
        precipitation: "0mm",
      },
    });

    expect(wrapper.text()).toContain("☀");
    expect(wrapper.text()).toContain("💧");
  });
});

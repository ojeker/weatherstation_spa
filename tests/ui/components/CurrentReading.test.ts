import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CurrentReading from "@/ui/components/CurrentReading.vue";

describe("CurrentReading", () => {
  const baseProps = {
    temperature: "12°C",
    sunshine: "80%",
    precipitation: "0mm",
    windSpeedKmh: null,
    windDirectionDeg: null,
  };

  it("displays temperature", () => {
    const wrapper = mount(CurrentReading, {
      props: baseProps,
    });

    expect(wrapper.text()).toContain("12°C");
  });

  it("displays sunshine percentage", () => {
    const wrapper = mount(CurrentReading, {
      props: baseProps,
    });

    expect(wrapper.text()).toContain("80%");
  });

  it("displays precipitation", () => {
    const wrapper = mount(CurrentReading, {
      props: {
        ...baseProps,
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
        windSpeedKmh: null,
        windDirectionDeg: null,
      },
    });

    const text = wrapper.text();
    expect(text.match(/—/g)?.length).toBe(3);
  });

  it("displays weather icons", () => {
    const wrapper = mount(CurrentReading, {
      props: baseProps,
    });

    expect(wrapper.text()).toContain("☀");
    expect(wrapper.text()).toContain("💧");
  });

  it("displays wind indicator when wind data is available", () => {
    const wrapper = mount(CurrentReading, {
      props: {
        ...baseProps,
        windSpeedKmh: 25,
        windDirectionDeg: 180,
      },
    });

    expect(wrapper.find(".wind-indicator").exists()).toBe(true);
    expect(wrapper.text()).toContain("25 km/h");
  });

  it("hides wind indicator when wind data is null", () => {
    const wrapper = mount(CurrentReading, {
      props: baseProps,
    });

    expect(wrapper.find(".wind-indicator").exists()).toBe(false);
  });
});

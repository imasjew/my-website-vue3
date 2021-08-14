<template>
  <div
    class="bar-container"
    :style="barContainerSize"
    @mousedown="clickPosition($event)"
  >
    <div class="bar-current" :style="barCurrentStyle"></div>
    <div
      class="bar-handle"
      :class="['bar-handle', !isReady ? 'handle-loading' : '']"
      :style="barHandleStyle"
      @mousedown="dragPosition($event)"
    ></div>
  </div>
</template>
<script lang="ts">
import { computed } from "@vue/runtime-core";
export default {
  name: "Slider",
  props: [
    "verticalMode",
    "barLength",
    "barWeight",
    "currentPosition",
    "forbidden",
    "isReady",
  ],
  emits: ["setPosition", "dragMouseDown", "dragMouseMove", "dragMouseUp"],
  setup(props: any, { emit }: any) {
    const barContainerSize = computed(() => {
      if (props.verticalMode) {
        return {
          width: props.barWeight + "px",
          height: props.barLength + "px",
        };
      } else {
        return {
          width: props.barLength + "px",
          height: props.barWeight + "px",
        };
      }
    });
    const barHandleStyle = computed(() => {
      let position;
      if (props.verticalMode) {
        position = {
          bottom: props.currentPosition + "%",
          left: -props.barWeight / 2 + "px",
          "margin-bottom": -props.barWeight + "px",
        };
      } else {
        position = {
          left: props.currentPosition + "%",
          top: -props.barWeight / 2 + "px",
          "margin-left": -props.barWeight + "px",
        };
      }
      return {
        width: props.barWeight + "px",
        height: props.barWeight + "px",
        "border-radius": props.barWeight + "px",
        border: props.barWeight / 2 + "px solid white",
        ...position,
      };
    });
    const barCurrentStyle = computed(() => {
      let style;
      if (props.verticalMode) {
        style = {
          width: props.barWeight + "px",
          height: props.currentPosition + "%",
          "box-shadow": "none",
        };
      } else {
        style = {
          height: props.barWeight + "px",
          width: props.currentPosition + "%",
        };
      }
      return {
        "border-radius": props.barWeight / 2 + "px",
        ...style,
      };
    });
    const clickPosition = (e: MouseEvent) => {
      if (props.forbidden === true) {
        return;
      }
      const offsetPosition = props.verticalMode
        ? props.barLength - e.offsetY
        : e.offsetX;
      const barRate = offsetPosition / props.barLength;
      emit("setPosition", barRate);
    };
    const dragPosition = (e: MouseEvent) => {
      e.stopPropagation(); // 避免触发process-handle的点击
      if (props.forbidden === true) {
        return;
      }
      emit("dragMouseDown");
      const mousedownPosition = props.verticalMode ? -e.clientY : e.clientX; // 鼠标初始绝对定位, 竖向为从下向上递增，所以取负减少后续重复判断
      const targetElement = e.target as HTMLElement;
      const offsetPosition = props.verticalMode
        ? -targetElement.offsetTop
        : targetElement.offsetLeft; // 滑块基础相对位置
      // 修正了自身体积后的滑块位置, 竖向从下向上递增，所以需额外补偿一份容器全长否
      const originHandlePosition = props.verticalMode
        ? offsetPosition - props.barWeight + props.barLength
        : offsetPosition + props.barWeight;
      document.onmousemove = (e) => {
        const newClientPosition = props.verticalMode ? -e.clientY : e.clientX; // 鼠标新定位
        let offset = newClientPosition - mousedownPosition; // 鼠标新老定位相减计算移动距离
        let position = originHandlePosition + offset; // 滑块获得同样的移动距离
        // 滑块移动边界限制
        if (position <= 0) {
          position = 0;
        }
        if (position >= props.barLength) {
          position = props.barLength;
        }
        const barRate = position / props.barLength;
        emit("dragMouseMove", barRate);
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        emit("dragMouseUp");
      };
    };

    return {
      barContainerSize,
      barHandleStyle,
      barCurrentStyle,
      clickPosition,
      dragPosition,
    };
  },
};
</script>

<style lang="less">
.bar-container {
  position: relative;
  margin: auto auto;
  background-color: #151515;
  border-radius: 4px;
  box-shadow: 0 1px 1px #444, 0 2px 2px black inset;
  .bar-current {
    position: absolute;
    bottom: 0;
    box-shadow: 0 1px 1px #f55 inset, 0 2px 2px #111;
    background-color: #c22;
    pointer-events: none;
  }
  .bar-handle {
    position: absolute;
    background-color: #c22;
    box-shadow: 0 2px 2px #111;
  }
  .bar-handle:hover {
    background-color: #c33;
    box-shadow: 0 0 6px white;
  }
  .handle-loading {
    background-color: #e77;
    border-color: #eee !important;
  }
  .handle-loading:hover {
    background-color: #e77;
    border-color: #eee !important;
    box-shadow: none;
  }
}
</style>

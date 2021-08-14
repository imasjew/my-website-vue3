<template>
  <div class="lyric-page-wrapper">
    <!-- <div>{{ currentSentenceIndex }}</div> -->
    <div class="title-wrapper">
      {{ songTitle }}
    </div>
    <div class="vocal-wrapper" v-if="!instrumental">
      <div class="lyric-wrapper">
        <div v-for="(sentence, index) in lyric" :key="index">
          <span
            :class="[
              { 'highlight-sentence': index == currentSentenceIndex },
              { 'empty-sentence': sentence.lyric === '' },
              'lyric',
            ]"
            @click="skipByLyric(sentence.time)"
            >{{ sentence.lyric }}</span
          >
        </div>
      </div>
    </div>
    <!-- 用v-if的话，会因为加载次序问题无法获取其style报错 -->
    <div class="instrumental-wrapper" v-show="instrumental">
      <div class="album-title">器乐作品，请欣赏</div>
      <div class="album-picture-wrapper">
        <img
          :src="albumPicture"
          alt=""
          ref="albumPictureDom"
          class="album-picture album-picture-animation"
        />
      </div>
    </div>
    <div class="backward-button">
      <i class="el-icon-back" @click="goToMusicList()"></i>
    </div>
  </div>
</template>

<script lang="ts">
import httpService from "@/service/http.service";
import Bus from "@/bus";
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { dealLyric } from "@/utils/musicUtils"
import { FormedLyric } from '@/service/interface';
export default {
  name: "musiclyric",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const albumPictureDom = ref();

    let songTitle = ref("");
    let lyric = ref<FormedLyric[]>();
    let albumPicture = ref("");
    let instrumental = ref(false);
    let currentSentenceIndex = ref();

    onMounted(() => {
      Bus.on("checkLyricProcess", (process) => {
        checkLyricProcess(process);
      });
      Bus.on("setPlayState", (state) => {
        setTimeout(() => {
          setPlayState(state);
        }, 100);
      });
      getPageInfo();
    });
    onUnmounted(() => {
      // off没有起作用，找了文档没解决，总之应该是这么写才对
      // 这个bug引起了179行的报错
      // 反复从歌词页退回列表再进入，还会重复订阅多次
      // 不过先屏蔽报错暂时没有引发其他明显bug
      // Bus.off("checkLyricProcess")
      // Bus.off("setPlayState")
    })
    watch(
      () => route.fullPath,
      () => {
        getPageInfo();
      }
    );

    const getPageInfo = () => {
      const songId = Number(router.currentRoute.value.query.id);
      if (songId) {
        getSongDetail(songId);
        getLyric(songId);
      }
    };
    const getSongDetail = (songId: number) => {
      httpService.getSongDetail(songId).then(
        (res: any) => {
          songTitle.value = res.songs[0].name;
          albumPicture.value = res.songs[0].al.picUrl;
        },
        () => {
          console.log("歌曲信息加载失败");
        }
      );
    };
    const getLyric = (songId: number) => {
      httpService.getLyric(songId).then(
        (res: any) => {
          if (res.lrc) {
            const originLyric = res.lrc.lyric;
            lyric.value = dealLyric(originLyric);
            instrumental.value = false;
          } else {
            lyric.value = [{ time: 0, lyric: "纯音乐，请欣赏" }];
            instrumental.value = true;
            // 切歌重置唱片角度，但不知道为何必须延时，而且时间短了还有可能失败
            albumPictureDom.value.classList.remove("album-picture-animation");
            setTimeout(() => {
              albumPictureDom.value.classList.add("album-picture-animation");
            }, 100);
          }
        },
        (err) => {
          console.log("请求失败", err);
        }
      );
    };

    const checkLyricProcess = (process: number) => {
      if (!lyric.value) {
        return;
      }
      const maxLength = lyric.value.length;
      if (maxLength <= 1) {
        return;
      }
      if (process >= lyric.value[maxLength - 1].time) {
        currentSentenceIndex.value = maxLength - 1;
        return;
      }
      for (let i = 0; i <= maxLength - 1; i++) {
        if (
          process > lyric.value[i].time &&
          process < lyric.value[i + 1].time
        ) {
          currentSentenceIndex.value = i;
          return;
        }
      }
    };
    const skipByLyric = (time: number) => {
      Bus.emit("skipByLyric", time);
    };
    const setPlayState = (state: boolean) => {
      // 70行Bus.off无法生效，导致渲染页面前就调用Bus.on拿不到dom报错，先避免报错凑合用
      if(!albumPictureDom.value) {
        return
      }
      if (state) {
        albumPictureDom.value.style.animationPlayState = "running";
      } else {
        albumPictureDom.value.style.animationPlayState = "paused";
      }
    };
    const goToMusicList = () => {
      Bus.emit("goToMusicList", songTitle.value);
    };

    return {
      songTitle,
      lyric,
      albumPicture,
      instrumental,
      currentSentenceIndex,
      albumPictureDom,
      skipByLyric,
      goToMusicList,
      router,
    };
  },
};
</script>

<style lang="less">
.lyric-page-wrapper {
  position: relative;
  .title-wrapper {
    padding: 48px 0 32px 0;
    font-size: 24px;
    color: #303133;
  }
  .lyric-wrapper {
    padding-bottom: 88px;
    .lyric {
      // white-space: pre-line;
      position: relative;
      font-size: 16px;
      color: #303133;
      line-height: 32px;
      display: inline-block;
      cursor: pointer;
      user-select: none;
    }
    .highlight-sentence {
      position: relative;
      padding: 0 6px;
      font-size: 20px;
      border-radius: 8px;
      box-shadow: 1px 1px 8px black;
      display: inline-block;
    }
    .empty-sentence {
      height: 32px;
      line-height: 32px;
      box-shadow: none;
      display: inline-block;
    }
  }
  .album-title {
    margin-bottom: 48px;
  }
  .album-picture-wrapper {
    position: relative;
    margin: auto;
    width: 500px;
    height: 500px;
    border: 3px solid #111;
    border-radius: 250px;
    background-color: #222;
    background-image: linear-gradient(-45deg, black, #3c3c3c, black);
    box-shadow: 0 0 20px black;
    .album-picture {
      position: relative;
      margin: auto;
      margin-top: 75px;
      width: 350px;
      height: 350px;
      border: 4px solid #1b1b1b;
      border-radius: 175px;
      box-sizing: border-box;
      user-select: none;
    }
    .album-picture-animation {
      animation-name: revolve;
      animation-duration: 21s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      animation-play-state: paused;
    }
  }
  .backward-button {
    position: absolute;
    left: 24px;
    top: 18px;
    i {
      font-size: 24px;
      color: #909399;
    }
    i:hover {
      color: #303133;
      text-shadow: 0 0 4px gray;
    }
  }
}

@keyframes revolve {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

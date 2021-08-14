<template>
  <div>
    <div class="search-wrapper">
      <el-input
        placeholder="请输入内容"
        v-model="input"
        clearable
        @keydown.enter="searchList()"
      >
        <template #append>
          <el-button icon="el-icon-search" @click="searchList()"></el-button>
        </template>
      </el-input>
    </div>
    <div class="song-list-wrapper">
      <el-table
        :data="tableData"
        stripe
        style="width: 100%"
        class="wrapper-color"
      >
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column width="40">
          <template #default="scope">
            <i
              :class="[
                'el-icon-video-play',
                { playing: scope.$index == currentIndex },
              ]"
              @click="addSong(scope.$index, scope.row.id, false)"
            ></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="歌曲标题"
          width="350"
          :show-overflow-tooltip="true"
        >
          <template #default="scope">
            <span
              class="song-title"
              @click="addSong(scope.$index, scope.row.id, true)"
              >{{ scope.row.title }}</span
            >
          </template>
        </el-table-column>

        <el-table-column
          prop="author"
          label="作者"
          width="150"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          prop="albumName"
          label="专辑"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column label="时长" width="70">
          <template #default="scope">
            {{ $filters.formatDate(scope.row.duration) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>


<script lang="ts">
import httpService from "@/service/http.service";
import Bus from "@/bus";
import { ref } from "@vue/reactivity";
import { onMounted } from "@vue/runtime-core";
import { useRoute, useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import { formatSongList } from '@/utils/musicUtils'
import { SongDetail } from '@/service/interface';
export default {
  name: "musiclist",
  setup() {
    const input= ref<string>("");
    const currentIndex = ref<number | null>(null);
    const tableData = ref<SongDetail[]>();
    const route = useRoute();
    const router = useRouter();

    onMounted(() => {
      if (route.query.name) {
        input.value = route.query.name as string;
        searchList();
      }
    });

    const searchList = () => {
      if (input.value === "") {
        return;
      }
      router.push("?name=" + input.value);
      httpService.getSongList(input.value).then(
        (res: any) => {
          const songs = res.result.songs;
          if (songs) {
            tableData.value = [];
            tableData.value = formatSongList(songs);
          }
        },
        (err) => {
          console.log("songList请求失败", err);
        }
      );
    };

    const addSong = (index: number, songId: number, goToLyric: boolean) => {
      httpService.checkSong(songId).then(
        () => {
          currentIndex.value = index;
          Bus.emit("addSongDetail", songId);
          if (goToLyric) {
            Bus.emit("goToLyric", songId);
          }
        },
        (err) => {
          showAlert(err.data.message);
        }
      );
    };
    const showAlert = (msg: string) => {
      ElNotification({
        message: msg,
      });
    };

    return {
      input,
      currentIndex,
      tableData,
      searchList,
      addSong,
    };
  },
};
</script>

<style lang="less">
.search-wrapper {
  margin: 32px;
  .el-input {
    width: 400px;
  }
}
.song-list-wrapper {
  width: 900px;
  margin: 0 auto;
  padding-bottom: 80px;
  .song-title {
    cursor: pointer;
  }
  .song-title:hover {
    color: black;
  }
  .el-table td {
    padding: 4px 0;
    .el-icon-video-play {
      font-size: 20px;
      line-height: 28px;
      color: #999;
      cursor: pointer;
    }
    .el-icon-video-play:hover {
      color: #555;
      text-shadow: 0 0 1px #555;
    }
    .playing {
      color: #c44;
      text-shadow: 0 0 1px #c44;
    }
    .playing:hover {
      color: #c44;
      text-shadow: 0 0 1px #c44;
    }
  }
  .el-table::before {
    height: 0; // 去除底部白线，会遮盖底部组件
  }
}
</style>

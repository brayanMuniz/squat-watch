<template>
  <div class="home">
    <div>Chart</div>
    <video v-if="videoReady" ref="videoPlayer">
      <source :src="videoUrl" />
    </video>
    <button @click="playVid" type="button">Play Vid</button>
    <button @click="pauseVid" type="button">Pause Vid</button>

    <div>Stats</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";

export default Vue.extend({
  name: "Home",
  data() {
    return {
      videoReady: false,
      videoUrl: "",
    };
  },
  async mounted() {
    // this is the actual name of the video NOT the url link
    const testVideo = "redditsave.com_numa_numa-t8vuqusl0fm61.mp4";
    let testVideRef = firebaseApp.storage().ref(testVideo);
    await testVideRef
      .getDownloadURL()
      .then((url) => {
        this.videoUrl = url;
        this.videoReady = true;
      })
      .catch((err) => {
        this.videoUrl = "";
        this.videoReady = false;
        console.error(err);
      });
  },
  methods: {
    playVid() {
      this.$refs["videoPlayer"].play();
    },
    pauseVid() {
      this.$refs["videoPlayer"].pause();
    },
  },
});
</script>

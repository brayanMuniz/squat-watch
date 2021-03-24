<template>
  <div>
    <h1>This is where you will upload the videos</h1>
    <form @submit.prevent="uploadVideo">
      <div class="form-group">
        <label for="Starting Amount">Select A File for Profile Image:</label>
        <input
          ref="upload"
          name="file-upload"
          @change="previewFiles"
          type="file"
          class="form-control"
          id="Profile Image"
        />
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
export default Vue.extend({
  data() {
    return {
      videoUpload: new Blob(),
    };
  },
  async mounted() {
    if (firebaseApp.auth().currentUser?.uid) {
      console.log("User is signed in ");
    }
  },
  methods: {
    previewFiles(event: any): void {
      this.videoUpload = event.target.files[0];
      console.log(this.videoUpload);
    },
    async uploadProfilePicture(myUid: string) {
      if (this.videoUpload) {
        // TODO: Update this later to have the correct data format
        let fileNamePlaceHolder = "testUpload";
        const imageUserRef = firebaseApp
          .storage()
          .ref(`users/${myUid}/${fileNamePlaceHolder}`);

        await imageUserRef.put(this.videoUpload).then((res) => {
          console.log(res.state);
        });
      }
    },
    uploadVideo() {
      const myUid: string | undefined = firebaseApp.auth().currentUser?.uid;
      if (myUid == undefined) {
        alert("Something is wrong. Hold up.");
      } else {
        this.uploadProfilePicture(myUid);
      }
    },
  },
});
</script>
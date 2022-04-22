<template>
  <Experiment title="Color Reference Game">
    <InstructionScreen :title="'Welcome, nice to see you!'">
      <p>Thank you for participating in our experiment!</p>
      <p>
        Thank you for participating in our study. In this study, you will be
        paired with another MTurk worker and are asked to communicate and
        identify colors. It will take approximately <strong>3</strong> minutes.
      </p>
      <p>Click on the button below to receive instructions.</p>
    </InstructionScreen>

    <InstructionScreen :title="'General Instructions'">
      <p>
        In this experiment you will play a communication game with another MTurk
        worker. In each round, you and your partner are shown three color
        patches. One of you will see a thick black border around one of those
        patches. This player will be called the <strong>manager</strong>. The
        other player is the <strong>intern</strong>. It's the goal in each round
        that the intern can find and click on that color. The manager needs to
        tell the intern which color patch they need to click on.
      </p>
      <p>
        You can talk to each other freely over a chat box. Remember that both of
        you can see the same colors but in a scrambled order, which means that
        <strong>information about the location is not useful</strong>. Once the
        intern feels confident enough, they can click on one of the colors. The
        experiment then moves on to the next round. The roles will be assigned
        at random.
      </p>
      <p>
        You can now enter the lobby to wait for a partner. The matching
        procedure should be fairly quick, so please pay attention and don't let
        your partner wait.
      </p>
    </InstructionScreen>

    <ConnectInteractiveScreen />

    <template v-for="i of 5">
      <Screen
        :key="i"
        :title="
          role === 'speaker' ? 'You are the manager' : 'You are the intern'
        "
      >
        <Slide>
          <WaitForParticipants
            :number="2"
            @done="
              initColors();
              $magpie.nextSlide();
            "
          />
          <p>Waiting for participants...</p>
        </Slide>

        <Slide>
          <p v-if="role === 'speaker'">
            Send messages to tell the intern which object is the target (the one
            with the border).
          </p>
          <p v-if="role === 'listener'">
            Communicate with the manager using the chatbox. Click on the target
            object which the manager is telling you about once you feel
            confident enough.
          </p>
          <Chat
            class="color-chat"
            @update:data="$magpie.addTrialData($event)"
          />
          <div
            v-for="colorType in colorsOrder"
            :key="colorType"
            :class="['color', colorType, role]"
            :style="{ background: produceCSSColor(colors[colorType]) }"
            @click="onClickColor(colorType)"
          />
        </Slide>
      </Screen>
    </template>

    <PostTestScreen />
    <SubmitResultsScreen />
  </Experiment>
</template>

<script>
import _ from 'lodash';
export default {
  name: 'App',
  data() {
    return {
      colors: {},
      colorsOrder: []
    };
  },
  socket: {
    init(colors) {
      this.colors = colors;
      this.colorsOrder = _.shuffle(Object.keys(colors));
    },
    choose() {
      this.$magpie.nextScreen();
    }
  },
  computed: {
    role() {
      return this.$magpie.socket.player === 1 ? 'speaker' : 'listener';
    }
  },
  methods: {
    initColors() {
      this.$magpie.socket.broadcast('init', this.sampleColors());
    },
    sampleColors() {
      const opts = { fixedLuminosity: true };

      // Sample the three colors to be used as the target colors.
      const target = this.randomColor(opts);
      const firstDistractor = this.randomColor(opts);
      const secondDistractor = this.randomColor(opts);

      return {
        target,
        firstDistractor,
        secondDistractor
      };
    },
    randomColor(options = {}) {
      const h = ~~(Math.random() * 360);
      const s = ~~(Math.random() * 100);
      const l = options.fixedLuminosity ? 50 : ~~(Math.random() * 100);
      return [h, s, l];
    },
    produceCSSColor(hslArray) {
      return `hsl(${hslArray[0]},${hslArray[1]}%,${hslArray[2]}%)`;
    },
    onClickColor(colorType) {
      if (this.role === 'speaker') {
        return;
      }

      this.$magpie.addTrialData({
        ...this.colors,
        colors_order: this.colorsOrder,
        selected_type: colorType,
        selected_color: this.colors[colorType]
      });
      this.$magpie.saveMeasurements();
      this.$magpie.socket.broadcast('choose');
    }
  }
};
</script>
<style>
.color {
  width: 250px;
  height: 100px;
  border: white 5px solid;
  float: right;
}
.color.target.speaker {
  border: black 5px dashed;
}
.color-chat {
  float: left;
}
</style>

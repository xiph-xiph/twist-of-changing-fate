import Animation from "./Animation.js";


export default class AnimationManager {
    constructor() {
        this.animations = [];
    }

    addAnimation(animation) {
        this.animations.push(animation);
    }
}
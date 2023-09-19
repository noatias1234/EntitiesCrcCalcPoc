<template>
    <label for="coordinateSystem">Select Coordinate System:</label>
    <select id="coordinateSystem" v-model="selectedCoordinateSystem" @change="convertCoordinates">
        <option v-for="system in coordinateSystems" :value="system">{{ system }}</option>
    </select>

    <CoordinateFormat :selectedCoordinateSystem="selectedCoordinateSystem">
    </CoordinateFormat>
</template>
  
<script>
import { CoordinateSystems } from './CoordinateSystems.js';
import CoordinateFormat from './CoordinateFormatComponent.vue';
import { ref } from "vue";
export default {
    name: 'Coordinate',
    components: {
        CoordinateFormat
    },
    setup() {
        let selectedCoordinateSystem = ref();
        let coordinateSystems = CoordinateSystems;
        selectedCoordinateSystem.value = CoordinateSystems.GEO_DMS;

        return {
            selectedCoordinateSystem,
            coordinateSystems,
            CoordinateFormat


        };
    },

}
</script>

<style scoped>
.coordinate-control {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    margin-top: 20px;
}

.coordinate-input {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.coordinate-input label {
    flex: 1;
}

.coordinate-input input {
    flex: 2;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

.formatted-coordinates {
    font-weight: bold;
    margin-top: 10px;
}
</style>
  
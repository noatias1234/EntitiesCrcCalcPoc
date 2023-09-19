<template>
    <div>
        <div class="coordinate-input">
            <label for="lat">Latitude:</label>
            <input type="text" id="lat" v-model="lat" @input="UpdateValues" />
        </div>
        <div class="coordinate-input">
            <label for="lon">Longitude:</label>
            <input type="text" id="lon" v-model="lon" @input="UpdateValues" />
        </div>
        <div class="formatted-coordinates">Formatted Coordinates: {{ coordinate }}</div>
    </div>
</template>

<script>
import { computed, ref } from "vue";
import { convertCoordinates } from '../convertors/coordinateConvertor';
export default {
    name: 'CoordinateFormat',
    props: ['formattedCoordinates', 'selectedCoordinateSystem'],
    setup(props) {
        let lat = ref();
        let lon = ref();
        let coordinate = ref('');
        let coordinateSystem = computed(() => { return props.selectedCoordinateSystem });

        function UpdateValues() {
            coordinate.value = convertCoordinates(coordinateSystem, lat, lon);
            console.log(coordinate.value);
        }
        return { lat, lon, coordinate, coordinateSystem, UpdateValues }
    }
}
</script>

<style scoped></style>
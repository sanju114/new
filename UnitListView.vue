<template>
  <div>
    <!-- Table Container Card -->
    <b-card class="mb-0">
      <div class="header-coman-area filter-btn-add">
        <div class="filter-outer">
          <div>
            <h4 class="card-title">{{ $t("unit.Units") }}</h4>
          </div>
          <div class="filter-btn-outer" v-if="!isGroupEntity">
            <b-button
              variant="primary"
              size="sm"
              @click="showFilter = !showFilter"
            >
              <feather-icon icon="FilterIcon" size="15" />
            </b-button>
          </div>
        </div>
        <div class="right-side-btn" v-if="!isGroupEntity">
          <div :class="showFilter ? 'mr-15' : 'mr-15 filter-btn'">
            <label class="search-label">{{ $t("unit.Entries") }}</label>
            <v-select
              :clearable="false"
              id="vue-select"
              class="per-page-selector d-inline-block fix-83"
              v-model="perPage"
              :options="option"
            />
          </div>
          <div
            :class="showFilter ? 'mr-15' : 'mr-15 filter-btn'"
            v-if="!isGroupEntity"
          >
            <div class="d-flex align-items-center justify-content-end">
              <label class="search-label">Search</label>
              <b-form-input
                v-model="filter"
                debounce="1000"
                class="d-inline-block search-bg"
                placeholder="Search..."
              />
            </div>
          </div>
          <div class="mr-15 last-2-50" v-if="!isGroupEntity">
            <b-button
              v-if="
                checkAbility({
                  action: constants.PERMISSIONS_ACTION.ADD,
                  subject: constants.PERMISSIONS_MODEL.UNITS
                })
              "
              variant="primary"
              :to="{ name: 'unit-creation' }"
            >
              <feather-icon icon="PlusIcon" size="12" />
              <span class="d-none d-sm-inline">{{
                $t("device.AddRecord")
              }}</span>
            </b-button>
          </div>
          <div class="mr-15 last-2-50 ls-btn-group">
            <b-form-radio-group
              v-model="selectedView"
              class="list item-view-radio-group cust-css-radio"
              buttons
              button-variant="outline-primary"
            >
              <template v-for="option in viewOptions">
                <b-form-radio
                  :value="option.value"
                  :key="option.text"
                  @change="listViewIconPressed"
                >
                  <span id="list_tool">
                    <feather-icon :icon="option.text" size="20" />
                  </span>
                </b-form-radio>
              </template>
            </b-form-radio-group>
            <b-tooltip delay="100" variant="primary" target="list_tool">{{
              $t("tooTip.listView")
            }}</b-tooltip>
            <b-tooltip delay="100" variant="primary" target="map_tool">{{
              $t("tooTip.mapView")
            }}</b-tooltip>
          </div>
        </div>
      </div>
      <div class="list-view-tab" v-if="listView">
        <b-skeleton-table
          v-if="showLoading"
          :rows="10"
          :columns="5"
          :table-props="{ bordered: true, striped: true }"
        />
        <b-table
          v-if="!showLoading"
          class="position-relative sim-icon-mb header-left-align"
          responsive
          show-empty
          align-v="end"
          :items="items"
          :fields="tableColumns"
          :empty-text="$t('NoMatchingRecordsFound')"
        >
          <template #cell(unit_name)="row">
            <b-media class="align-item-center unit-list-map-icon-parent-1">
              <template #aside>
                <span class="unit-list-map-icon-parent">
                  <b-avatar if square size="40" :src="row.item.file_name_url" />
                </span>
              </template>
              <h6 class="mb-0">
                {{ `${row.item.name ? `${row.item.name}` : " "}` }}
              </h6>
              <template #title>
                <feather-icon icon="UserIcon" size="16" class="mr-0 mr-sm-50" />
                <span class="d-none d-sm-inline">{{ $t("user.User") }}</span>
              </template>
            </b-media>
          </template>
          <template #cell(unit_attached_to)="row">
            {{
              `${
                row.item["parent_unit.name"]
                  ? `${row.item["parent_unit.name"]}`
                  : " "
              }`
            }}</template
          >
          <template #cell(device)="row">
            <ul v-if="row.item.devices.length" class="device-list">
              <li
                :class="!isConsumerAccount ? 'device-list-li' : ''"
                @click="redirectToDevice(device)"
                :key="device.id"
                v-for="device in row.item.devices"
              >
                <b-link
                  v-if="!isConsumerAccount"
                  :to="{
                    name: 'view-device',
                    params: {
                      id: device.id
                    },
                    query: { page: parseInt(currentPage ? currentPage : 1) }
                  }"
                >
                  {{ device.device_name }}
                </b-link>
                <span v-if="isConsumerAccount">
                  {{ device.device_name }}
                </span>
              </li>
            </ul>
          </template>
          <template #cell(unit_allocated_to)="row">{{
            `${row.item["account.name"] ? `${row.item["account.name"]}` : " "}`
          }}</template>
          <template #cell(unit_driver)="row">{{
            `${
              row.item["user.first_name"]
                ? `${row.item["user.first_name"]}`
                : " "
            }` +
            " " +
            `${
              row.item["user.last_name"] ? `${row.item["user.last_name"]}` : " "
            }`
          }}</template>
          <template #cell(status)="row"
            ><b-badge
              class="badge-cust"
              :variant="resolveFilterBadgeColor(row.item.status)"
            >
              {{ `${row.item.status ? `${row.item.status}` : " "}` }}
            </b-badge></template
          >
          <template #cell(labels)="row">
            <DynamicBadge
              :isList="true"
              :entityType="'UNIT'"
              :tags="row.item.labels"
              :showTextInBadge="Number(7)"
              :event="row.item"
              :maxTagShow="Number(1)"
              :listApi="getAllUnitList"
            ></DynamicBadge>
          </template>
          <template #cell(ACTIONS)="row">
            <div class="text-left track_tool">
              <span :id="row.item.track_tool" class="track-anchor">
                <b-link
                  :to="{ name: 'track-unit', params: { id: row.item.id } }"
                >
                  <RouteIcon class="curserPointer imgss track-icon" />
                </b-link>
              </span>
              <b-tooltip
                delay="100"
                variant="primary"
                :target="row.item.track_tool"
                >{{ $t("tooTip.trackUnit") }}</b-tooltip
              >
              <span
                v-b-tooltip.hover.top.v-primary
                :title="$t('tooTip.allocation')"
                v-b-modal.unit-allocate
                @click="showPopUp(row.item)"
                v-if="
                  !restrictAllocation &&
                  checkAbility({
                    action: constants.PERMISSIONS_ACTION.UPDATE,
                    subject: constants.PERMISSIONS_MODEL.UNITS
                  })
                "
              >
                <AllocationIcon class="allocate-icon" />
              </span>
              <span :id="row.item.id">
                <b-link
                  :to="{
                    name: 'view-unit',
                    params: { id: row.item.id, isEnabled: true }
                  }"
                  v-if="
                    checkAbility({
                      action: constants.PERMISSIONS_ACTION.READ,
                      subject: constants.PERMISSIONS_MODEL.UNITS
                    })
                  "
                >
                  <feather-icon
                    icon="EyeIcon"
                    class="curserPointer text-primary action-icon"
                    size="18"
                  />
                </b-link>
              </span>
              <span :id="row.item.up_tool">
                <b-link
                  v-if="
                    row.item.isUnitEditable &&
                    checkAbility({
                      action: constants.PERMISSIONS_ACTION.UPDATE,
                      subject: constants.PERMISSIONS_MODEL.UNITS
                    })
                  "
                  :to="{
                    name: 'edit-unit',
                    params: { id: row.item.id, isEnabled: false }
                  }"
                >
                  <feather-icon
                    icon="EditIcon"
                    class="curserPointer text-primary action-icon"
                    size="18"
                  />
                </b-link>
              </span>
              <span>
                <feather-icon
                  v-b-tooltip.hover.top.v-primary
                  :title="$t('tooTip.delete')"
                  v-if="
                    row.item.isUnitEditable &&
                    checkAbility({
                      action: constants.PERMISSIONS_ACTION.DELETE,
                      subject: constants.PERMISSIONS_MODEL.UNITS
                    })
                  "
                  icon="Trash2Icon"
                  class="text-danger action-icon curserPointer"
                  size="18"
                  v-b-modal.modal-sm-remove
                  @click="deleteUnit(row.item)"
                />
              </span>
            </div>

            <b-tooltip
              delay="100"
              variant="primary"
              :target="row.item.up_tool"
              >{{ $t("tooTip.update") }}</b-tooltip
            >
            <b-tooltip delay="100" variant="primary" :target="row.item.id">{{
              $t("tooTip.view")
            }}</b-tooltip>
          </template>
        </b-table>
        <div class="mx-2 mb-2">
          <b-row>
            <b-col
              cols="12"
              sm="6"
              class="d-flex align-items-center justify-content-center justify-content-sm-start"
            >
              &nbsp;
            </b-col>
            <!-- Pagination -->
            <b-col
              cols="12"
              sm="6"
              class="d-flex align-items-center justify-content-center justify-content-sm-end"
            >
              <b-pagination
                v-model="currentPage"
                :total-rows="totalDevices"
                :per-page="perPage"
                first-number
                last-number
                class="mb-0 mt-1 mt-sm-0"
                prev-class="prev-item"
                next-class="next-item"
              >
                <template #prev-text>
                  <feather-icon icon="ChevronLeftIcon" size="18" />
                </template>
                <template #next-text>
                  <feather-icon icon="ChevronRightIcon" size="18" />
                </template>
              </b-pagination>
            </b-col>
          </b-row>
        </div>
      </div>
      <div class="map-view-tab" v-if="!listView">
        <div class="map-row">
          <div class="map-col">
            <l-map
              :zoom="zoom"
              :center="latLng ? latLng : [0, 0]"
              ref="unitMap"
              @update:center="updatelocation"
            >
              <l-tile-layer :url="url" :attribution="attribution" />
              <div
                v-for="iconUnit in markerArray"
                :key="iconUnit && iconUnit.id"
              >
                <l-marker
                  :lat-lng="createLatLng(iconUnit.position)"
                  :ref="iconUnit.id"
                >
                  <l-icon :icon-size="dynamicSize" :icon-anchor="dynamicAnchor">
                    <div class="pinletmarker unit12 unit-list-img">
                      <b-avatar
                        rounded
                        size="40"
                        :src="iconUnit.file_name_url"
                      />
                    </div>
                    <!--b-media-aside class="mr-75 marginLeftImg">
                      <b-avatar
                        rounded
                        size="220"
                        :src="
                          iconUnit && iconUnit.icon
                            ? `${downloadUrl}download/${iconUnit.icon}`
                            : null
                        "
                        :text="iconUnit && iconUnit.name[0]"
                        variant="primary"
                      />
                    </b-media-aside-->
                  </l-icon>
                  <l-popup class="tooltip-ui tooltip-info-on-map">
                    <b-button
                      variant="primary"
                      :class="
                        !iconUnit.devices || !iconUnit.devices.length
                          ? 'full-btn d-flex align-items-center no-sensor-data-5'
                          : 'full-btn d-flex align-items-center'
                      "
                    >
                      <!-- <feather-icon icon="PlusIcon" size="16" /> -->
                      {{ iconUnit.name }}
                    </b-button>
                    <template>
                      <div
                        class="no-sensor-data-4"
                        v-if="!iconUnit.devices || !iconUnit.devices.length"
                      >
                        {{ $t("unit.NoInformation") }}
                      </div>
                      <app-collapse
                        v-for="(device, key) in iconUnit.devices"
                        :key="key"
                      >
                        <app-collapse-item
                          v-if="iconUnit.devices.length > 1"
                          :isVisible="false"
                          :title="device.device_name"
                        >
                          <sensorInfo
                            v-if="device.data && device.data.messages"
                            :messages="device.data.messages"
                            :message_time="device.message_time"
                            :deviceObj="{ id: device.id }"
                            :unitObj="{ id: iconUnit.id }"
                            :options="{
                              isLiveMode: true
                            }"
                          ></sensorInfo>
                          <span
                            class="no-sensor-data"
                            v-if="!device.data || !device.data.messages"
                          >
                            {{ $t("unit.NoInformation") }}
                          </span>
                        </app-collapse-item>
                        <div
                          v-if="iconUnit.devices.length === 1"
                          class="no-sensor-data-1"
                        >
                          <span
                            class="no-sensor-data-2"
                            v-if="!device.data || !device.data.messages"
                          >
                            {{ $t("unit.NoInformation") }}
                          </span>
                          <sensorInfo
                            v-if="device.data && device.data.messages"
                            :messages="device.data.messages"
                            :message_time="device.message_time"
                            :deviceObj="{ id: device.id }"
                            :unitObj="{ id: iconUnit.id }"
                            :options="{
                              isLiveMode: true
                            }"
                          ></sensorInfo>
                        </div>
                      </app-collapse>
                    </template>
                  </l-popup>
                </l-marker>
              </div>
            </l-map>
          </div>
          <div class="list-col">
            <div class="unit-card">
              <div class="unit-list-outer">
                <b-skeleton-table
                  v-if="showLoading"
                  :rows="7"
                  :columns="1"
                  :table-props="{ bordered: true, striped: true }"
                />
                <b-card-body class="cardBody" v-if="!showLoading">
                  <div
                    v-for="(unit, key) in unitsData"
                    :key="key"
                    class="unitsData d-flex justify-content-between align-items-center"
                  >
                    <b-media no-body>
                      <b-form-checkbox
                        :value="unit.id"
                        v-model="selectedCheckbox"
                        @change="onUnitCheck(unit, $event.length > 0)"
                        class="form-control-merge cursor-pointer"
                      >
                      </b-form-checkbox>
                      <b-media-aside class="mr-75 marginLeftImg unit-list-img">
                        <b-avatar square size="30" :src="unit.file_name_url" />
                      </b-media-aside>
                      <b-media-body
                        class="my-auto mb-body cursor-pointer"
                        @click="
                          popupClick(unit.id);
                          onUnitCheck(unit, true);
                        "
                      >
                        <h6 class="mb-0 marginLeftImg text-col-unit">
                          {{ unit.name }}
                        </h6>
                      </b-media-body>
                    </b-media>
                    <div class="d-flex align-items-center">
                      <span :id="unit.id">
                        <b-link
                          :to="{ name: 'track-unit', params: { id: unit.id } }"
                        >
                          <RouteIcon class="imgss curserPointer" />
                        </b-link>
                      </span>
                      <b-tooltip
                        delay="100"
                        variant="primary"
                        :target="unit.id"
                        >{{ $t("tooTip.trackUnit") }}</b-tooltip
                      >
                    </div>
                  </div>
                </b-card-body>
              </div>
              <div class="pagination-outer">
                <b-pagination
                  v-model="currentPageUnit"
                  :total-rows="totalUnits"
                  :per-page="perPage"
                  first-number
                  last-number
                  class="mb-0 mt-sm-0"
                  prev-class="prev-item"
                  next-class="next-item"
                >
                  <template #prev-text>
                    <feather-icon icon="ChevronLeftIcon" size="18" />
                  </template>
                  <template #next-text>
                    <feather-icon icon="ChevronRightIcon" size="18" />
                  </template>
                </b-pagination>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-card>

    <AreYouSureModal
      :data="deleteData"
      :component="c1"
      :status="status"
      :onClose="onClose"
      :removedUser="removedUser"
    />
    <AllocationPopUp
      :allocationData="allocationData"
      :component="c1"
      :status="status"
      :isDevice="false"
      :isSelectedTab="isSelectedTab"
      :onClose="onClose"
      :changeInput="changeInput"
      :currentUnit="currentUnit"
      :refreshed="refreshed"
      :getAccountDetail="getAccountDetail"
    />
  </div>
</template>

<script>
import {
  BCard,
  BRow,
  BCol,
  BFormInput,
  BButton,
  BTable,
  BMedia,
  BMediaBody,
  BAvatar,
  BLink,
  BBadge,
  BDropdown,
  BDropdownItem,
  BPagination,
  BFormGroup,
  BModal,
  BForm,
  BImg,
  BFormCheckbox,
  BButtonGroup,
  BFormRadioGroup,
  BFormRadio,
  BCardHeader,
  BCollapse,
  BCardBody,
  BCardText,
  BMediaAside,
  BTooltip,
  VBTooltip,
  BSkeletonTable
} from "bootstrap-vue";
import vSelect from "vue-select";
import store from "@/store";
import UnitService from "@/libs/api/unit-service";
import DataService from "@/libs/api/data-service";
import ToastificationContent from "@core/components/toastification/ToastificationContent.vue";
import AreYouSureModal from "@/layouts/components/AreYouSureModal.vue";
import AllocationPopUp from "./AllocationPopUp.vue";
import RouteIcon from "@/assets/images/new-icon/route1.svg";
import AllocationIcon from "@/assets/images/icons/allocation.svg";
import {
  LMap,
  LTileLayer,
  LMarker,
  LCircle,
  LPolygon,
  LIcon,
  LPopup,
  LTooltip
} from "vue2-leaflet";
import ImageFallBack from "vue-fall-back-image-directive";
import { latLng, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import DynamicBadge from "@/layouts/components/DynamicBadge.vue";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});
import AppCollapse from "@core/components/app-collapse/AppCollapse.vue";
import AppCollapseItem from "@core/components/app-collapse/AppCollapseItem.vue";
import SensorInfo from "../sensor-views/sensorInfo.vue";
import SocketIOService from "@/libs/socket/sockets";
import constants from "@/utils/constants";
export default {
  components: {
    BCard,
    BRow,
    BCol,
    BFormInput,
    BButton,
    BTable,
    BMedia,
    BMediaBody,
    BAvatar,
    BLink,
    BBadge,
    BDropdown,
    BDropdownItem,
    BPagination,
    vSelect,
    BFormGroup,
    BModal,
    BForm,
    AreYouSureModal,
    BImg,
    AllocationPopUp,
    BFormCheckbox,
    BButtonGroup,
    BFormRadioGroup,
    BFormRadio,
    BCardHeader,
    BCollapse,
    BCardBody,
    BCardText,
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LPopup,
    LTooltip,
    BMediaAside,
    AppCollapse,
    AppCollapseItem,
    ImageFallBack,
    BTooltip,
    SensorInfo,
    VBTooltip,
    BSkeletonTable,
    RouteIcon,
    AllocationIcon,
    DynamicBadge
  },
  data() {
    return {
      tableColumns: [
        { key: "unit_name", Class: "" },
        { key: "device", tdClass: "" },
        { key: "unit_allocated_to", Class: "" },
        { key: "status", tdClass: "status-width" },
        { key: "ACTIONS", tdClass: "action-width-unit-list" }
      ],
      selected: "10",
      option: ["10", "20", "30"],
      c1: null,
      status: false,
      deleteData: null,
      totalDevices: null,
      totalUnits: null,
      perPage: 10,
      showFilter: false,
      currentPageUnit: 1,
      currentPage: 1,
      items: [],
      clearPage: false,
      unitsData: null,
      unitsData1: [],
      downloadUrl: process.env.VUE_APP_FILE_URL,
      basePublicUrl: `${window.location.origin}/images/icons/`,
      filter: "",
      allocationData: null,
      currentUnit: null,
      listView: false,
      zoom: 6,
      selectedCheckbox: [],
      selectedView: "mapScreen",
      markerArray: [],
      iconSize: 40,
      latLng: latLng(18.34224, 73.4532),
      previous_selected_checkbox_length: 0,
      url: process.env.VUE_APP_ICON_URL,
      togglePopup: false,
      lastOpenPopup: "",
      showLoading: "false",
      isConsumerAccount: true,
      restrictAllocation: false,
      attribution:
        '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      isConsumer:
        localStorage.getItem("USER_ACCOUNT_TYPE") === "CONSUMER" ? true : false,
      viewOptions: [
        { text: "ListIcon", value: "listScreen" },
        { text: "MapPinIcon", value: "mapScreen" }
      ]
    };
  },
  props: ["isGroupEntity", "groupName"],
  setup() {
    const resolveFilterBadgeColor = (filter) => {
      filter = filter && filter.toUpperCase();
      const status = {
        ACTIVE: "light-success",
        INACTIVE: "light-warning",
        DAMAGED: "light-danger",
        BLOCKED: "light-secondary"
      };

      const selectedStatus =
        filter && status[filter] ? status[filter] : status["ACTIVE"];

      return selectedStatus;
    };
    return {
      resolveFilterBadgeColor
    };
  },
  directives: {
    "b-tooltip": VBTooltip
  },
  computed: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    }
  },
  watch: {
    selectedCheckbox() {
      if (!this.selectedCheckbox.length) {
        this.previous_selected_checkbox_length = 0;
        var map = this.$refs.unitMap.mapObject;
        this.removeMarkerArray();
        // map.remove();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.latLng = [
                position.coords.latitude,
                position.coords.longitude
              ];
            },
            (error) => {
              console.log(error);
            }
          );
        } else {
          this.latLng = [18.34224, 73.4532];
        }
        map.setView(this.latLng, 6);
        return;
      }
      ((this.previous_selected_checkbox_length == 0 ||
        this.previous_selected_checkbox_length <
          this.selectedCheckbox.length) &&
        this.addMarkerArray()) ||
        (this.previous_selected_checkbox_length >
          this.selectedCheckbox.length &&
          this.removeMarkerArray());
      this.showIconOnMap();
      this.previous_selected_checkbox_length = this.selectedCheckbox.length;
    },
    perPage() {
      if (!this.perPage) {
        this.perPage = 10;
      }
      this.getAllUnitList();
    },
    currentPageUnit() {
      this.getAllUnitList();
    },
    currentPage() {
      this.getAllUnitList();
      this.clearPage = true;
    },
    filter() {
      this.getAllUnitList();
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },
  mounted() {
    if (
      this.checkAbility({
        action: constants.PERMISSIONS_ACTION.READ,
        subject: constants.PERMISSIONS_MODEL.LABELS
      })
    ) {
      this.tableColumns.splice(-1, 0, {
        key: "labels",
        tdClass: "operator-group-width labels-width",
        thClass: "text-right"
      });
    }
    this.restrictAllocation =
      localStorage.getItem("USER_SUB_ACCOUNTS_RESTRICTED") == "true"
        ? true
        : false;
    this.listView = this.$route.name === "unit-list" ? true : false;
    this.selectedView =
      this.$route.name === "unit-list" ? "listScreen" : "mapScreen";
    this.isGroupEntity ? (this.listView = this.isGroupEntity) : "";
    this.$refs.unitMap.mapObject.invalidateSize();
    this.getAllUnitList();
    this.controlMapZoom();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latLng = [position.coords.latitude, position.coords.longitude];
        },
        (error) => {
          console.log(error);
        }
      );
    }
  },
  methods: {
    controlMapZoom() {
      var map = this.$refs.unitMap.mapObject;
      var array = this.markerArray.map((item) => [
        item.position["latitude"],
        item.position["longitude"]
      ]);
      array.length && map.fitBounds(array);
    },
    popupClick(id) {
      this.togglePopup =
        this.togglePopup && this.lastOpenPopup === id ? false : true;
      this.lastOpenPopup = id;
      const checkDuplicate = this.selectedCheckbox.filter(
        (item) => item === id
      );
      if (checkDuplicate && checkDuplicate.length === 0) {
        this.selectedCheckbox.push(id);
      }
      setTimeout(() => {
        this.$nextTick(() => {
          if (this.togglePopup) {
            this.$refs[id][0].mapObject.openPopup();
          } else {
            this.$refs[id][0].mapObject.closePopup();
            this.selectedCheckbox = this.selectedCheckbox.filter(
              (item) => item !== id
            );
          }
        });
      }, 50);
    },
    mapShown() {
      setTimeout(() => {
        //mapObject is a property that is part of leaflet
        this.$refs.unitMap.mapObject.invalidateSize();
      }, 1000);
      // setup
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latLng = [position.coords.latitude, position.coords.longitude];
          },
          (error) => {
            console.log(error);
          }
        );
      }
      const provider = new OpenStreetMapProvider();
      const map = this.$refs.mymap.mapObject;
    },
    redirectToTrackUnit(unit) {
      this.$router.push({
        name: "track-unit",
        params: {
          id: unit.id
        }
      });
    },
    redirectToDevice(device) {
      if (this.isConsumerAccount) {
        return;
      }
      this.$router.push({
        name: "view-device",
        params: {
          id: device.id
        },
        query: { page: parseInt(this.currentPage) }
      });
    },
    createLatLng(position) {
      return latLng(position.latitude, position.longitude);
    },
    addMarkerArray() {
      this.markerArray.push(
        this.unitsData1.find(
          (item) =>
            item.id == this.selectedCheckbox[this.selectedCheckbox.length - 1]
        )
      );
    },
    removeMarkerArray() {
      this.markerArray = [];
      // const selectedMarker = this.unitsData.filter(u => this.selectedCheckbox.includes(u.id))
      for (let i = 0; i < this.unitsData1.length; i++) {
        if (this.markerArray.length == this.selectedCheckbox.length) break;
        if (this.selectedCheckbox.includes(this.unitsData1[i].id)) {
          this.markerArray.push(this.unitsData1[i]);
        }
      }
    },
    async showIconOnMap() {
      const faultyUnit = this.unitsData.find(
        (item) =>
          item.id == this.selectedCheckbox[this.selectedCheckbox.length - 1]
      );

      if (!faultyUnit.position.latitude) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: `No co-ordinates`,
            text: `${faultyUnit.name.toUpperCase()} unit do not have position co-ordinates`,
            icon: "InfoIcon",
            variant: "danger"
          }
        });
        this.selectedCheckbox.pop();

        return;
      }
      this.controlMapZoom();
    },

    updatelocation(latLng) {
      this.latLng = [latLng.lat, latLng.lng];
    },
    listViewIconPressed() {
      if (this.selectedView === "listScreen") {
        this.listView = true;
        this.$router.push({ name: "unit-list" });
      } else {
        this.$router.push({ name: "unit-map" });
        this.listView = false;
      }
    },
    mapViewIconPressed() {
      this.$router.push({ name: "unit-map" });
      this.listView = false;
    },
    async changeInput(allocationData) {
      this.allocationData = allocationData;
    },
    showPopUp(props) {
      this.c1 = "src/views/Unit/AllocationPopUp.vue";
      this.status = true;
      this.$bvModal.show("unit-allocate");
      this.allocationData = props;
      this.currentUnit = Object.assign(props, {});
      this.currentUnit.unit_driver_id = this.currentUnit["user.id"];
    },
    refreshed() {
      this.getAllUnitList();
    },
    editUnit(props, isEditable) {
      this.$router.push({
        name: "edit-unit",
        params: { id: props, isEnabled: isEditable }
      });
    },
    viewUnit(props, isEditable) {
      this.$router.push({
        name: "view-unit",
        params: { id: props, isEnabled: isEditable }
      });
    },
    deleteUnit(props) {
      this.c1 = "src/layouts/components/AreYouSureModal.vue";
      this.status = true;
      this.deleteData = { name: props.name, id: props.id };
    },
    getAccountDetail(data) {
      this.isConsumerAccount = data.type == "CONSUMER";
      // this.tableColumns[2] =
      //   data.type == "CONSUMER" ? "unit_driver" : "unit_allocated_to";
    },
    async removedUser(props) {
      this.deleteData = { name: "", id: "" };
      if (props.id) {
        try {
          this.onClose();
          let response = await new UnitService().deleteUnit({
            id: props.id
          });

          if (response && response.data) {
            this.$toast({
              component: ToastificationContent,
              props: {
                title: this.$t("unit.DeletedSuccessfully"),
                icon: "EditIcon",
                variant: "success"
              }
            });

            this.getAllUnitList();
          } else if (response && response.error && response.error.message) {
            this.$toast({
              component: ToastificationContent,
              props: {
                title: response.error.title,
                text: response.error.message,
                icon: "EditIcon",
                variant: "error"
              }
            });
          }
        } catch (err) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: err.message,
              icon: "InfoIcon",
              variant: "danger"
            }
          });
        }
      }
    },
    onClose() {
      this.$bvModal.hide("modal-sm-remove");
    },
    async getAllUnitList() {
      try {
        this.showLoading = true;
        this.currentPage =
          parseInt(this.$route.query.page) || this.currentPage || 1;
        let requestData = {
          page: this.listView ? this.currentPage : this.currentPageUnit,
          page_size: parseInt(this.perPage),
          search_unit: this.filter
        };
        if (this.groupName) {
          requestData.label = this.groupName;
        }
        let response = await new UnitService().getAllUnits(requestData);
        this.showLoading = false;
        if (response && response.data) {
          this.items = response.data.units;
          this.items = this.items.map((u) => {
            u.allocate_tool = `allocate${u.id}`;
            u.track_tool = `track${u.id}`;
            u.up_tool = `up${u.id}`;
            u.del_tool = `del${u.id}`;
            u.labels = u.labels || [];
            return u;
          });
          this.totalDevices = response.data.pagination.total_records;

          this.unitsData1 = [...this.unitsData1, ...response.data.units];

          this.unitsData = response.data.units;

          this.totalUnits = response.data.pagination.total_records;

          if (this.clearPage) {
            this.$router.replace({ query: {} });
          }
        } else if (response && response.error && response.error.message) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: response.error.title,
              text: response.error.message,
              icon: "InfoIcon",
              variant: "danger"
            }
          });
        }
      } catch (err) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: err.message,
            icon: "InfoIcon",
            variant: "danger"
          }
        });
      }
    },
    isSelectedTab() {
      this.$bvModal.hide("is-unit-allocated");
    },
    onUnitCheck(unit, checked) {
      this.subscribeUnitData(unit, checked);
    },
    async subscribeUnitData(unit, subscribe) {
      if (this.markerArray.length == 0 && this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      if (!this.socket) {
        this.socket = new SocketIOService();
        await this.socket.setupSocketConnection();
      }
      if (subscribe && !unit.subscribed) {
        const posItem = this.markerArray.find((item) => item.id == unit.id);
        unit.subscribed = true;
        this.socket.subscribeEventWithFunction(`UM_${unit.id}`, (data) => {
          for (const device of unit.devices) {
            if (device.id === data.device_id) {
              if (posItem) {
                for (const device of posItem.devices) {
                  if (device.id === data.device_id) {
                    device.message_time = data.data.time;
                    device.data = data.data;
                  }
                }
                const gps = data.data.messages.find((msg) => msg.type == "GPS");
                if (gps) {
                  this.updatelocation({
                    lat: gps.data.latitude,
                    lng: gps.data.longitude
                  });
                  posItem.position.latitude = gps.data.latitude;
                  posItem.position.longitude = gps.data.longitude;
                  this.controlMapZoom();
                }
              }
              device.message_time = data.data.time;
              device.data = data.data;
              break;
            }
          }
        });
      } else if (unit.subscribed) {
        unit.subscribed = false;
        this.socket.unsubscribeEventWithFunction(`UM_${unit.id}`);
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>

<style lang="scss">
@import "@core/scss/vue/libs/vue-select.scss";
@import "@core/scss/vue/libs/vue-flatpicker.scss";
@import "./index.scss";
@import "~@core/scss/base/bootstrap-extended/_variables.scss";

.vue2leaflet-map {
  &.leaflet-container {
    height: 60vh !important;
    font-family: inherit;
  }
}
.no-sensor-data {
  padding-left: 30px;
  padding-bottom: 20px !important;
}
.no-sensor-data-1 {
  padding-bottom: 10px;
  padding-top: 10px;
}
.no-sensor-data-2 {
  padding-left: 30px;
}
.no-sensor-data-4 {
  padding-left: 30px;
  padding-bottom: 10px;
}
.no-sensor-data-5 {
  margin-bottom: 6px;
}
.map-outer {
  width: 100%;
}
.track-anchor {
  margin-right: 10px;
}
.badge-cust {
  height: 20px;
  display: inline-block;
  border-radius: 17px;
  margin-right: 24px;
  background: var(--rgb_gray_dark);
  color: var(--red2);
  padding: 4px 9px !important;
}
.tooltip-info-on-map {
  .card-body {
    padding: 0px !important;
  }
  .modal-info {
    padding-left: 17px;
    padding-right: 17px;
    .media {
      min-width: 20px;
      h6 {
        padding-left: 9px;
      }
      img {
        max-height: 20px;
        max-width: 20px;
        margin-right: 0px !important;
      }
    }
    .marginLeftImg {
      margin: 0 !important;
      padding: 0 !important;
    }
    .b-avatar.badge-light-primary {
      background-color: transparent !important;
    }
  }
  .align-self-center.my-auto {
    font-size: 11px;
  }
  .btn.full-btn.d-flex.align-items-center.btn-primary {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .signal-icon {
    height: 20px;
    width: 20px;
    display: flex;
    align-items: baseline;
    .signal {
      width: 4px;
      border: 1px solid var(--primary);
      margin-right: 1.5px;
      border-radius: 2px 2px 0px 0px;
    }
    .level-1 {
      height: $px_10;
    }
    .level-2 {
      height: 13px;
    }
    .level-3 {
      height: $px_15;
    }
    .level-4 {
      height: 18px;
    }
    .fill {
      background-color: var(--primary);
    }
  }
  .card-header {
    .collapse-title {
      font-size: 14px;
      color: $headings-color;
      font-weight: 500;
    }
  }
}
.unit12 {
  .b-avatar {
    .b-avatar-img {
      img {
        margin-bottom: 20px;
        position: absolute;
        padding: 5px;
      }
    }
  }
}
.map-col {
  float: left;
  width: 70%;
  background-color: $gray8;
  min-height: 60vh;
  margin-bottom: $px_10;
}

.list-col {
  float: left;
  width: calc(30% - 35px);
  margin-left: 20px;
  min-height: 60vh;
  margin-bottom: $px_10;
}
.unit-card {
  min-height: 60vh;
}
.map-row {
  width: $percent_100;
  height: $percent_100;
}
svg.route-svg,
.route-svg path {
  fill: var(--primary);
}
.action-width-unit-list {
  max-width: 200px;
  width: 200px;
  min-width: 200px;
}
.status-width {
  max-width: 130px;
  width: 130px;
  min-width: 130px;
  text-align: center;
}
.group-width {
  max-width: 180px;
  width: 180px;
  min-width: 180px;
  text-align: left;
  .event-Tag .media-body {
    justify-content: flex-start;
  }
}
</style>


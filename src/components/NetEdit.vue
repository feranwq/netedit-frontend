<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useDeviceStore } from "../store/device";
import { NButton,NInput,NTable,NModal,NRadioButton,NRadioGroup } from "naive-ui";
import axios from "axios";

const deviceList = reactive<string[]>([
  "lo99",
  "ens99",
  "eth99",
]);
const netList = reactive<string[]>([
  "192.168.22.1/24",
  "192.168.33.1/24",
  "192.168.44.1/24",
]);

const updateNetList = async (device: string) => {
  await axios
      .get(`/api/ip?device=${device}`)
      .then(response => {
        let res = response.data.data.iplist ? response.data.data.iplist : []
        netList.splice(0, netList.length, ...res);
      })
}

onMounted(async () => {
  await axios
      .get('/api/device')
      .then(response => {
        let res = response.data.data.devicelist ? response.data.data.devicelist : []
        deviceList.splice(0, deviceList.length, ...res);
      })
})

onMounted(() => {
  if (device.selectDevice){
    updateNetList(device.selectDevice)
  }
})

const updateIP = async (device: string, oldip: string, newip: string): Promise<boolean> => {
  console.log("updateIP:", oldip, newip);
  let res = false
  await axios
  .put(`/api/ip?device=${device}&oldip=${oldip}&newip=${newip}`)
  .then(function (response) {
    if (response.data?.code === 0) {
      res = true
    }
  });
  return res
}

const addIP = async (device: string, ip: string): Promise<boolean> => {
  console.log("addIP:", ip);
  let res = false
  await axios
  .post(`/api/ip?device=${device}&ip=${ip}`)
  .then(function (response) {
    if (response.data?.code === 0) {
      res = true
    }
  });
  return res
}

const deleteIP = async (device: string, ip: string): Promise<boolean> => {
  console.log("deleteIP:", ip);
  let res = false

  await axios
  .delete(`/api/ip?device=${device}&ip=${ip}`)
  .then(function (response) {
    if (response.data?.code === 0) {
      res = true
    }
  });

  return res
}

const isEditing = ref<boolean>(false);
const isAdding = ref<boolean>(false);
const editedItem = ref<string | null>(null);
const editedItemIndex = ref<number | null>(null);

const removeNetList = async (idx: number) => {
  let ok = await deleteIP(device.selectDevice, netList[idx])
  if (ok) {
    // updateNetList(device.selectDevice);
    netList.splice(idx, 1);
  }

}

const editItem = (item: string, index: number) => {
  isEditing.value = true;
  isAdding.value = false;
  editedItem.value = item;
  editedItemIndex.value = index;
};

const saveItem = async (index?: number) => {
  let itemValue: string = editedItem.value ? editedItem.value : "";
  let ok:boolean
  if (isEditing.value) {
    ok = await updateIP(device.selectDevice, netList[index!], itemValue);
    if (ok) {
      netList.splice(index!, 1, itemValue);
      // updateNetList(device.selectDevice);
    }
    isEditing.value = false;
  } else if (isAdding.value) {
    ok = await addIP(device.selectDevice, itemValue);
    if (ok) {
      netList.push(itemValue);
      // updateNetList(device.selectDevice);
    }
    isAdding.value = false;
  }
};

const cancelItem = () => {
  if (isEditing.value) {
    isEditing.value = false;
  }

  if (isAdding.value) {
    isAdding.value = false;
  }
  editedItem.value = null;
  editedItemIndex.value = null;
};

const addItem = () => {
  isAdding.value = true;
  isEditing.value = false;
};
const device = useDeviceStore()
const deviceName = ref<string>("");
const setDevice = (name: string) => {
  device.setDevice(name)
}

const showModal = ref<boolean>(false);
const radioValue = ref<string>("");
</script>

<template>
  <div>
    <n-button @click="showModal = true" style="width: 100px;margin-right: 20px">
      选择网卡
    </n-button>
    <n-modal v-model:show="showModal" preset="dialog" title="网卡选择">
      <n-radio-group v-model:value="radioValue" name="deviceRadioGroup">
      <n-radio-button
        v-for="device in deviceList"
        :key="device"
        :value="device"
        :label="device"
        @click="deviceName = device"
      />
    </n-radio-group>
    <n-button type="primary" @click="showModal = false; setDevice(deviceName); updateNetList(device.selectDevice)">
      确定
    </n-button>
    </n-modal>
    <span>网卡为: {{ device.selectDevice }}</span>
  </div>
  <br>
  <br>

  <n-button type="primary" @click="addItem">添加</n-button>
  <n-table style="width: 620px; margin: 0 auto;" :bordered="false" :single-column="true">
    <tr v-for="(net, idx) in netList" :key="net">
      <template v-if="isEditing && editedItemIndex === idx">
        <td style="width: 30.3%"><n-input v-model:value="editedItem" /></td>
        <td style="width: 13.3%">
          <n-button type="primary" @click="saveItem(idx)">保存</n-button>
        </td>
        <td><n-button type="info" @click="cancelItem">取消</n-button></td>
      </template>
      <template v-else>
        <td style="width: 30.3%">{{ net }}</td>
        <td style="width: 13.3%">
          <n-button type="info" @click="editItem(net, idx)"> 修改 </n-button>
        </td>
        <td>
          <n-button type="error" @click.stop="removeNetList(idx)">
            删除
          </n-button>
        </td>
      </template>
    </tr>
    <template v-if="isAdding">
      <td style="width: 30.3%"><n-input v-model:value="editedItem" /></td>
      <td style="width: 13.3%">
        <n-button type="primary" @click="saveItem()">保存</n-button>
      </td>
      <td><n-button type="info" @click="cancelItem">取消</n-button></td>
    </template>
  </n-table>
</template>

<style scoped></style>

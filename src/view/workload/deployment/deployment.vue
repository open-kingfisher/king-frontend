<template>
  <div>
    <Row type="flex" justify="center" style="margin-bottom: 10px">
      <Col span="24">
        <Card dis-hover v-if="data1">
          <p slot="title">Deployment</p>
          <SearchTable :columns="columns" :data="data1">
            <ButtonGroup>
              <Button v-if="hasPerm('add_dep')" @click="createBtnClick('CREATE')" style="margin-right: 3px"
                      type="success">{{ this.$t('add') }}
              </Button>
              <Button v-if="hasPerm('a_add_dep')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px"
                      type="success" ghost>{{ this.$t('advanced_Add') }}
              </Button>
              <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
            </ButtonGroup>
          </SearchTable>
        </Card>
      </Col>
    </Row>
    <Row type="flex" justify="center">
      <Col span="24">
        <Card dis-hover v-if="data3">
          <p slot="title">Stateful Set</p>
          <SearchTable :columns="columns" :data="data3">
            <ButtonGroup>
<!--              <Button v-if="hasPerm('add_dep')" @click="createBtnClick('CREATE')" style="margin-right: 3px"-->
<!--                      type="success">{{ this.$t('add') }}-->
<!--              </Button>-->
              <Button v-if="hasPerm('a_add_dep')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px"
                      type="success" ghost>{{ this.$t('advanced_Add') }}
              </Button>
              <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
            </ButtonGroup>
          </SearchTable>
        </Card>
      </Col>
    </Row>
    <Row type="flex" justify="center" style="margin-bottom: 10px">
      <Col span="24">
        <Card dis-hover v-if="data2">
          <p slot="title">Daemon Set</p>
          <SearchTable :columns="columns" :data="data2">
            <ButtonGroup>
<!--              <Button v-if="hasPerm('add_dep')" @click="createBtnClick('CREATE')" style="margin-right: 3px"-->
<!--                      type="success">{{ this.$t('add') }}-->
<!--              </Button>-->
              <Button v-if="hasPerm('a_add_dep')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px"
                      type="success" ghost>{{ this.$t('advanced_Add') }}
              </Button>
              <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
            </ButtonGroup>
          </SearchTable>
        </Card>
      </Col>
    </Row>
    <Drawer
      :draggable=true
      :closable=false
      v-model="editShow"
      :scrollable=true
      width="50">
      <div slot="header">
        <span>{{optionTitle}} {{ctrl}}</span>
        <ButtonGroup style="float: right; margin-top: -5px">
          <Button @click="yaml()" size="small" :type="yamlType">Yaml</Button>
          <Button @click="json()" size="small" :type="jsonType">Json</Button>
        </ButtonGroup>
      </div>
      <YamlModal :editorContent="editorContent" @change="change" :editorLang="editorLang"></YamlModal>
      <div class="drawer-footer" style="margin-bottom: 1px">
        <Button type="text" style="margin-right: 5px" @click="editShow = false">{{this.$t('cancel')}}</Button>
        <Button type="primary" @click="update(option)">{{this.$t('commit')}}</Button>
      </div>
    </Drawer>
    <Modal v-model="deleteModel" width="360">
      <p slot="header" title="删除">
        <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认删除 <strong
          style="color:#f60;text-align:center">{{ctrl}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="deleteLoading" @click="del()">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal v-model="restartModel" width="360">
      <p slot="header" title="重启">
        <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认重启 <strong
          style="color:#f60;text-align:center">{{ctrl}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="restartLoading" @click="restart()">{{this.$t('restart')}}</Button>
      </div>
    </Modal>
    <Modal v-model="scaleModel" width="500" :title="optionTitle">
      <div style="text-align:center; margin-bottom: 30px">
        <Slider v-model="replicas" show-input :max="500"></Slider>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long @click="scale()">{{this.$t('scale')}}</Button>
      </div>
    </Modal>
    <Modal slot="option" v-model="templateShow" :title="optionTitle">
      <Form ref="createFormTemplate" :model="formItemTemplate" :rules="templateRuleValidate" :label-width="55">
        <FormItem label="名称" prop="name">
          <Input v-model="formItemTemplate.name"></Input>
        </FormItem>
        <FormItem label="描述" prop="describe">
          <Input v-model="formItemTemplate.describe"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="templateShow = false">{{this.$t('cancel')}}</Button>
        <Button type="primary" @click="fromTemplate()">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
    <Modal v-model="formAddModel" :title="optionTitle" width="900">
      <div style="width: 800px;margin-bottom: 15px;margin-left: 30px">
        <Steps :current="current">
          <Step title="基本信息"></Step>
          <Step title="存储卷"></Step>
          <Step title="容器组"></Step>
          <!--          <Step title="亲和性"></Step>-->
          <!--          <Step title="生命周期"></Step>-->
          <!--          <Step title="服务"></Step>-->
          <!--          <Step title="入口"></Step>-->
          <Step title="标签及注释"></Step>
        </Steps>
      </div>
      <hr style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px"/>
      <Form ref="createFormItem" v-show="current === 0" :model="formItemBase" :label-width="70">
      <!--模板选择-->
        <FormItem label="选择模板" v-if="templateDisplay">
          <Select v-model="formItemBase.template" placeholder="通过模板创建"
                  @on-change="templateChange(formItemBase.template)">
            <Option v-for="v in template" :value="v.name" :key="v.name">{{ v.name }}</Option>
          </Select>
        </FormItem>
       </Form>
      <Form ref="createFormItem" v-show="current === 0" :model="formItemBase" :label-width="70" :rules="ruleValidate">
        <FormItem :label="this.$t('name')" prop="name" class="ivu-form-item ivu-form-item-required">
          <Input v-model="formItemBase.name" :disabled="nameDisabled"></Input>
        </FormItem>
        <!--副本数-->
        <FormItem class="ivu-form-item ivu-form-item-required" label="副本数量">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="replicasNum">
                <Input v-model="formItemBase.replicasNum"></Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!--更新策略-->
        <FormItem class="ivu-form-item ivu-form-item-required" label="更新策略">
          <Select v-model="formItemBase.type">
            <Option value="RollingUpdate">滚动更新</Option>
            <Option value="Recreate">替换升级</Option>
          </Select>
        </FormItem>
        <!--更新策略具体设置-->
        <FormItem v-if="formItemBase.type === 'RollingUpdate'">
          <Row type="flex" justify="space-between">
            <Col span="12">
              <FormItem prop="rollingUpdate.maxUnavailable">
                <Input v-model="formItemBase.rollingUpdate.maxUnavailable">
                  <span slot="prepend">最小可用数量</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="1">
            </Col>
            <Col span="11">
              <FormItem prop="rollingUpdate.maxSurge">
                <Input v-model="formItemBase.rollingUpdate.maxSurge">
                  <span slot="prepend">最大激增数量</span>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="服务治理">
          <i-switch size="large" v-model="formItemBase.istioDisplay" :disabled="formItemBase.isitoDisabled" :true-value=1 :false-value=0>
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </FormItem>
        <!--节点选择-->
        <FormItem label="节点选择">
          <i-switch size="large" v-model="formItemBase.nodeDisplay" :true-value=1 :false-value=0>
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </FormItem>
        <FormItem v-if="formItemBase.nodeDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="12">
              <RadioGroup v-model="formItemBase.nodeSelectType" type="button">
                <Radio label="nodeLabels">通过标签选择节点</Radio>
                <Radio label="nodeAssign">直接指定节点</Radio>
              </RadioGroup>
            </Col>
          </Row>
        </FormItem>
        <FormItem style="margin-left: 60px" label="节点标签"
                  v-if="formItemBase.nodeDisplay === 1 && formItemBase.nodeSelectType === 'nodeLabels'">
          <Row type="flex" justify="space-between">
            <Select v-model="formItemBase.nodeSelector" multiple filterable placeholder="选择节点标签">
              <Option v-for="item in nodeSelector" :value="item.key + ':' + item.val" :key="item.key + ':' + item.val">{{ item.key }} : {{item.val}}
              </Option>
            </Select>
          </Row>
        </FormItem>
        <FormItem style="margin-left: 60px" label="选择节点"
                  v-if="formItemBase.nodeDisplay === 1 && formItemBase.nodeSelectType === 'nodeAssign'">
          <Select v-model="formItemBase.nodeAssign" placeholder="直接指定节点">
            <Option v-for="v in node" :value="v.name" :key="v.name">{{ v.name }}</Option>
          </Select>
        </FormItem>
        <!--label-->
        <hr style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px"/>
        <div v-for="(item, labelsIndex) in formItemBase.labels" :key="labelsIndex + 'labels'" :value="item">
          <FormItem :label="labelsIndex === 0 ? 'Pod标签': ''">
            <Row type="flex" justify="space-between">
              <Col span="7">
                <FormItem
                  :prop="'labels.' + labelsIndex + '.key'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                  <Input v-model="item.key" placeholder="请输入键" :disabled="nameDisabled">
                  </Input>
                </FormItem>
              </Col>
              <Col span="14">
                <FormItem
                  :prop="'labels.' + labelsIndex + '.key'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                  <Input v-model="item.val" placeholder="请输入值" :disabled="nameDisabled">
                  </Input>
                </FormItem>
              </Col>
              <Col span="1" offset="0">
                <Button type="dashed" @click="handleRemove('podLabels',labelsIndex)"
                        :disabled="formItemBase.labels.length === 1 || nameDisabled" icon="md-trash">
                </Button>
              </Col>
              <Col span="1" offset="0">
                <Button type="dashed" @click="handleAdd('podLabels')" icon="md-add" :disabled="nameDisabled">
                </Button>
              </Col>
            </Row>
          </FormItem>
        </div>
        <!--annotations-->
        <div v-for="(item, annotationsIndex) in formItemBase.annotations" :key="annotationsIndex + 'annotations'"
             :value="item">
          <FormItem :label="annotationsIndex === 0 ? 'Pod注解': ''">
            <Row type="flex" justify="space-between">
              <Col span="7">
                <Input v-model="item.key" placeholder="请输入键">
                </Input>
              </Col>
              <Col span="14">
                <Input v-model="item.val" placeholder="请输入值">
                </Input>
              </Col>
              <Col span="1" offset="0">
                <Button type="dashed" @click="handleRemove('podAnnotations',annotationsIndex)"
                        :disabled="formItemBase.annotations.length === 1" icon="md-trash">
                </Button>
              </Col>
              <Col span="1" offset="0">
                <Button type="dashed" @click="handleAdd('podAnnotations')" icon="md-add">
                </Button>
              </Col>
            </Row>
          </FormItem>
        </div>
      </Form>
      <Form ref="createFormItemVolume" v-show="current === 1" :model="formItemVolume" :label-width="60">
        <FormItem label="存储卷" prop="volume">
          <i-switch size="large" v-model="formItemVolume.volumeDisplay" :true-value=1 :false-value=0>
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </FormItem>
        <FormItem v-if="formItemVolume.volumeDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="12">
              <ButtonGroup>
                <Button @click="handleAdd('hostPathVolume')">主机路径</Button>
                <Button @click="handleAdd('secretVolume')">保密字典</Button>
                <Button @click="handleAdd('configMapVolume')">配置字典</Button>
                <Button @click="handleAdd('cephFSVolume')">CephFS</Button>
                <Button @click="handleAdd('emptyDir')">空目录</Button>
              </ButtonGroup>
            </Col>
          </Row>
        </FormItem>
        <div style="margin-left: 60px" v-for="(item, hostPathIndex) in formItemVolume.hostPath"
             :key="hostPathIndex + 'hostPath'" :value="item" v-if="formItemVolume.volumeDisplay === 1">
          <FormItem :label="hostPathIndex === 0 ? '主机路径': ''">
            <Row type="flex" justify="space-between">
              <Col span="8">
                <FormItem>
                  <Input v-model="item.name">
                    <span slot="prepend">卷名</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="9">
                <FormItem>
                  <Input v-model="item.path">
                    <span slot="prepend">路径</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Select v-model="item.type" placeholder="请选择主机路径类型">
                    <Option value="none">Empty</Option>
                    <Option value="DirectoryOrCreate">DirectoryOrCreate</Option>
                    <Option value="Directory">Directory</Option>
                    <Option value="FileOrCreate">FileOrCreate</Option>
                    <Option value="File">File</Option>
                    <Option value="Socket">Socket</Option>
                    <Option value="CharDevice">CharDevice</Option>
                    <Option value="BlockDevice">BlockDevice</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('hostPathVolume',hostPathIndex)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
        </div>
        <div style="margin-left: 60px" v-for="(item, secretIndex) in formItemVolume.secret"
             :key="secretIndex + 'secret'" :value="item" v-if="formItemVolume.volumeDisplay === 1">
          <FormItem :label="secretIndex === 0 ? '保密字典': ''">
            <Row type="flex" justify="space-between">
              <Col span="8">
                <FormItem>
                  <Input v-model="item.name">
                    <span slot="prepend">卷名</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="10">
                <FormItem>
                  <Select v-model="item.secretName" placeholder="保密字典">
                    <Option v-for="(item, index) in secret" :value="item.name" :key="index">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <InputNumber style="width: 123px" v-model="item.defaultMode" placeholder="权限，如：644">
                  </InputNumber>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('secretVolume',secretIndex)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
        </div>
        <div style="margin-left: 60px" v-for="(item, configMapIndex) in formItemVolume.configMap"
             :key="configMapIndex + 'configMap'" :value="item" v-if="formItemVolume.volumeDisplay === 1">
          <FormItem :label="configMapIndex === 0 ? '配置字典': ''">
            <Row type="flex" justify="space-between">
              <Col span="8">
                <FormItem>
                  <Input v-model="item.name">
                    <span slot="prepend">卷名</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="10">
                <FormItem>
                  <Select v-model="item.configMapName" placeholder="配置字典">
                    <Option v-for="(item, index) in configMap" :value="item.name" :key="index">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <InputNumber style="width: 123px" v-model="item.defaultMode" placeholder="权限，如：644">
                  </InputNumber>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('configMapVolume',configMapIndex)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
        </div>
        <div style="margin-left: 60px" v-for="(item, emptyDirIndex) in formItemVolume.emptyDir" :key="emptyDirIndex + 'emptyDir'" :value="item" v-if="formItemVolume.volumeDisplay === 1">
          <FormItem  label="空目录">
            <Row type="flex" justify="space-between">
              <Col span="15">
                <FormItem>
                  <Input v-model="item.name">
                     <span slot="prepend">卷名</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="7">
                <FormItem>
                   <Select v-model="item.emptyDir.medium">
                    <Option value="Empty">Empty</Option>
                    <Option value="Memory">Memory</Option>
                    <Option value="HugePages">HugePages</Option>
                   </Select>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('emptyDirVolume',emptyDirIndex)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
        </div>
        <div style="margin-left: 60px" v-for="(item, cephFSIndex) in formItemVolume.cephFS"
             :key="cephFSIndex + 'cephFS'" :value="item" v-if="formItemVolume.volumeDisplay === 1">
          <FormItem :label="cephFSIndex === 0 ? 'CephFS': ''">
            <Row type="flex" justify="space-between">
              <Col span="7">
                <FormItem>
                  <Input v-model="item.name">
                    <span slot="prepend">卷名</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="11">
                <FormItem>
                  <Input v-model="item.path">
                    <span slot="prepend">路径</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <Input v-model="item.user">
                    <span slot="prepend">用户</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('cephFSVolume',cephFSIndex)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem>
            <Row type="flex" justify="space-between">
              <Col span="9">
                <FormItem>
                  <Select v-model="item.secretRef.name" placeholder="秘钥">
                    <Option v-for="(item, index) in secret" :value="item.name" :key="index">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="14">
                <FormItem>
                  <Input v-model="item.monitors" placeholder="多地址请用“;”分隔">
                    <span slot="prepend">IP</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
        </div>
      </Form>
      <Form ref="createFormItemConfig" v-show="current === 2" :model="formItemConfig" :label-width="80">
        <!--容器相关配置-->
        <div v-for="(item, index) in formItemConfig.containers" :key="index" :value="item">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px"/>
          <!--容器类型-->
          <FormItem class="ivu-form-item ivu-form-item-required" label="容器类型">
            <Row type="flex" justify="space-between">
              <Col span="22">
                <Select v-model="item.containersType">
                  <Option value="containers">普通容器</Option>
                  <Option value="initContainers">Init容器</Option>
                </Select>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('formItemConfig', index)"
                        :disabled="formItemConfig.containers.length === 1" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
          <!--容器名-->
          <FormItem class="ivu-form-item ivu-form-item-required" label="容器名" v-if="0">
            <Row type="flex" justify="space-between">
              <Col span="24">
                <FormItem
                  :prop="'containers.' + index + '.name'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                  <Input v-model="item.name" placeholder="容器名，不能重复">
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!--镜像地址-->
          <FormItem class="ivu-form-item ivu-form-item-required" label="镜像地址">
            <Row type="flex" justify="space-between">
              <Col span="17">
                <FormItem
                  :prop="'containers.' + index + '.image'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                  <Input v-model="item.image" placeholder="镜像地址">
                  </Input>
                </FormItem>
              </Col>
              <Col span="6" offset="0" style="margin-right: 0px">
                <Select v-model="item.imagePullPolicy" placeholder="镜像拉取策略">
                  <Option value="IfNotPresent">优先本地镜像（IfNotPresent）</Option>
                  <Option value="Always">尝试重新下载（Always）</Option>
                  <Option value="Never">仅使用本地镜像（Never）</Option>
                </Select>
              </Col>
            </Row>
          </FormItem>
          <!--特权模式-->
          <FormItem label="特权模式">
            <i-switch size="large" v-model="formItemConfig.containers[index].privileged" :true-value=1
                      :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <!--Port-->
          <FormItem label="容器端口">
            <i-switch size="large" v-model="formItemConfig.containers[index].portsDisplay" :true-value=1 :false-value=0
                      @on-change="handleAdd('portsAdd', index)">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <div v-for="(item, portsIndex) in formItemConfig.containers[index].ports" :key="portsIndex + 'ports'"
               :value="portsIndex" v-if="formItemConfig.containers[index].portsDisplay === 1">
            <FormItem>
              <Row type="flex" justify="space-between">
                <Col span="7">
                  <FormItem>
                    <Input v-model="item.name">
                      <span slot="prepend">端口名</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="6" offset="0" style="margin-right: 0px">
                  <FormItem>
                    <Select v-model="item.protocol" placeholder="协议">
                      <Option value="TCP">TCP</Option>
                      <Option value="UDP">UDP</Option>
                      <Option value="SCTP">SCTP</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="8">
                  <FormItem
                    :prop="'containers.' + index + '.ports.' + portsIndex + '.containerPort'"
                    :rules="{required: true, message: '必须是非零数字', pattern:/^\+?[1-9][0-9]*$/, trigger: 'blur'}">
                    <Input v-model="item.containerPort">
                      <span slot="prepend">容器端口</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('ports', index, portsIndex)" icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleAdd('ports', index)" icon="md-add">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!--VolumeMount-->
          <FormItem label="挂载卷">
            <i-switch size="large" v-model="formItemConfig.containers[index].volumeMountDisplay" :true-value=1
                      :false-value=0 @on-change="handleAdd('volumeMountAdd', index)">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <div v-for="(item, volumeMountIndex) in formItemConfig.containers[index].volumeMounts"
               :key="volumeMountIndex + 'volumeMount'" :value="volumeMountIndex"
               v-if="formItemConfig.containers[index].volumeMountDisplay === 1">
            <FormItem>
              <Row type="flex" justify="space-between">
                <Col span="8" offset="0" style="margin-right: 0px">
                  <FormItem>
                    <Select v-model="item.name" placeholder="卷名">
                      <Option v-for="volume in volumeName" :value="volume.name" :key="volume.name" :label="volume.name">
                        <span>{{volume.name}}</span>
                        <span style="float:right;color:#ccc">{{volume.type}}</span>
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="11">
                  <FormItem>
                    <Input v-model="item.mountPath">
                      <span slot="prepend">挂载路径</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="2">
                  <FormItem>
                    <Select v-model="item.readOnly" placeholder="只读">
                      <Option value="true">是</Option>
                      <Option value="false">否</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('volumeMount', index, volumeMountIndex)" icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleAdd('volumeMount', index)" icon="md-add">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!--资源配额-->
          <FormItem label="资源配额">
            <i-switch size="large" v-model="formItemConfig.containers[index].resourcesDisplay" :true-value=1
                      :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <!--CPU配额-->
          <FormItem label="CPU" v-if="formItemConfig.containers[index].resourcesDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="12">
                <FormItem
                  :prop="'containers.' + index + '.resources.requests.cpu'"
                  :rules="{required: false, message: '必须是非零数字', pattern:/^\+?[1-9][0-9]*$/ , trigger: 'blur'}">
                  <Input v-model="formItemConfig.containers[index].resources.requests.cpu">
                    <span slot="prepend">最小要求</span>
                    <Select v-model="formItemConfig.containers[index].resources.requests.cpuUnit" slot="append"
                            style="width: 70px">
                      <Option value="m">m</Option>
                      <Option value="core">core</Option>
                    </Select>
                  </Input>
                </FormItem>
              </Col>
              <Col span="1">
              </Col>
              <Col span="11">
                <FormItem
                  :prop="'containers.' + index + '.resources.limits.cpu'"
                  :rules="{required: false, message: '必须是非零数字', pattern:/^\+?[1-9][0-9]*$/ , trigger: 'blur'}">
                  <Input v-model="formItemConfig.containers[index].resources.limits.cpu">
                    <span slot="prepend">最大限制</span>
                    <Select v-model="formItemConfig.containers[index].resources.limits.cpuUnit" slot="append"
                            style="width: 70px">
                      <Option value="m">m</Option>
                      <Option value="core">core</Option>
                    </Select>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!--内存配额-->
          <FormItem label="内存" v-if="formItemConfig.containers[index].resourcesDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="12">
                <FormItem
                  :prop="'containers.' + index + '.resources.requests.memory'"
                  :rules="{required: false, message: '必须是非零数字', pattern:/^\+?[1-9][0-9]*$/ , trigger: 'blur'}">
                  <Input v-model="formItemConfig.containers[index].resources.requests.memory">
                    <span slot="prepend">最小要求</span>
                    <Select v-model="formItemConfig.containers[index].resources.requests.memoryUnit" slot="append"
                            style="width: 70px">
                      <Option value="Ki">Ki</Option>
                      <Option value="Mi">Mi</Option>
                      <Option value="Gi">Gi</Option>
                      <Option value="Ti">Ti</Option>
                    </Select>
                  </Input>
                </FormItem>
              </Col>
              <Col span="1">
              </Col>
              <Col span="11">
                <FormItem
                  :prop="'containers.' + index + '.resources.limits.memory'"
                  :rules="{required: false, message: '必须是非零数字', pattern:/^\+?[1-9][0-9]*$/ , trigger: 'blur'}">
                  <Input v-model="formItemConfig.containers[index].resources.limits.memory">
                    <span slot="prepend">最大限制</span>
                    <Select v-model="formItemConfig.containers[index].resources.limits.memoryUnit" slot="append"
                            style="width: 70px">
                      <Option value="Ki">Ki</Option>
                      <Option value="Mi">Mi</Option>
                      <Option value="Gi">Gi</Option>
                      <Option value="Ti">Ti</Option>
                    </Select>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem label="命令与参数">
            <i-switch size="large" v-model="formItemConfig.containers[index].commandDisplay" :true-value=1
                      :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <FormItem v-if="formItemConfig.containers[index].commandDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="12">
                <ButtonGroup>
                  <Button @click="handleAdd('command', index)">命令</Button>
                  <Button @click="handleAdd('args', index)">参数</Button>
                </ButtonGroup>
              </Col>
            </Row>
          </FormItem>
          <!--命令-->
          <div style="margin-left: 40px" v-for="(item, commandIndex) in formItemConfig.containers[index].command"
               :key="commandIndex + 'command'" :value="item.key">
            <FormItem :label="commandIndex === 0 ? '命令': ''"
                      v-if="formItemConfig.containers[index].commandDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="22">
                  <FormItem>
                    <Input v-model="item.key">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('command', index, commandIndex)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!--参数-->
          <div style="margin-left: 40px" v-for="(item, argsIndex) in formItemConfig.containers[index].args"
               :key="argsIndex + 'args'" :value="item.key">
            <FormItem :label="argsIndex === 0 ? '参数': ''" v-if="formItemConfig.containers[index].commandDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="22">
                  <FormItem>
                    <Input v-model="item.key">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('args', index, argsIndex)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!--环境变量-->
          <FormItem label="环境变量">
            <i-switch size="large" v-model="formItemConfig.containers[index].envDisplay" :true-value=1 :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <FormItem v-if="formItemConfig.containers[index].envDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="12">
                <ButtonGroup>
                  <Button @click="handleAdd('env', index)">自定义</Button>
                  <Button @click="handleAdd('configMap', index)">配置字典</Button>
                  <Button @click="handleAdd('secret', index)">保密字典</Button>
                  <Button @click="handleAdd('field', index)">描述字段</Button>
                </ButtonGroup>
              </Col>
            </Row>
          </FormItem>
          <!--手动输入环境变量-->
          <div style="margin-left: 60px" v-for="(item, envIndex) in formItemConfig.containers[index].env"
               :key="envIndex + 'env'" :value="item">
            <FormItem v-if="formItemConfig.containers[index].envDisplay === 1" :label="envIndex === 0 ? '自定义': ''">
              <Row type="flex" justify="space-between">
                <Col span="10">
                  <FormItem>
                    <Input v-model="item.name">
                      <span slot="prepend">名称</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem>
                    <Input v-model="item.value">
                      <span slot="prepend">值</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('env',index, envIndex)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!--通过configMap获取-->
          <div style="margin-left: 60px"
               v-for="(item, envFromConfigMapIndex) in formItemConfig.containers[index].envFromConfigMap"
               :key="envFromConfigMapIndex + 'envFromConfigMap'" :value="item">
            <FormItem v-if="formItemConfig.containers[index].envDisplay === 1"
                      :label="envFromConfigMapIndex === 0 ? '配置字典': ''">
              <Row type="flex" justify="space-between">
                <Col span="7">
                  <FormItem>
                    <Input v-model="item.name">
                      <span slot="prepend">名称</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="8">
                  <FormItem>
                    <Select v-model="item.valueFrom.name" placeholder="资源"
                            @on-change="getKeyByConfigMap(item.valueFrom.name)">
                      <Option v-for="(item, index) in configMap" :value="item.name" :key="index">{{ item.name }}
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="7">
                  <FormItem>
                    <Select v-model="item.valueFrom.key" placeholder="键">
                      <Option v-for="(item, index) in configMapKey" :value="item" :key="index">{{ item }}</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('configMap',index, envFromConfigMapIndex)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!--通过secret获取-->
          <div style="margin-left: 60px"
               v-for="(item, envFromSecretIndex) in formItemConfig.containers[index].envFromSecret"
               :key="envFromSecretIndex + 'envFromSecret'" :value="item">
            <FormItem v-if="formItemConfig.containers[index].envDisplay === 1"
                      :label="envFromSecretIndex === 0 ? '保密字典': ''">
              <Row type="flex" justify="space-between">
                <Col span="7">
                  <FormItem>
                    <Input v-model="item.name">
                      <span slot="prepend">名称</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="8">
                  <FormItem>
                    <Select v-model="item.valueFrom.name" placeholder="资源"
                            @on-change="getKeyBySecret(item.valueFrom.name)">
                      <Option v-for="(item, index) in secret" :value="item.name" :key="index">{{ item.name }}</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="7">
                  <FormItem>
                    <Select v-model="item.valueFrom.key" placeholder="键">
                      <Option v-for="(item, index) in secretKey" :value="item" :key="index">{{ item }}</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('secret',index, envFromSecretIndex)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!--field获取-->
          <div style="margin-left: 60px"
               v-for="(item, envFromFieldIndex) in formItemConfig.containers[index].envFromField"
               :key="envFromFieldIndex + 'envFromField'" :value="item">
            <FormItem v-if="formItemConfig.containers[index].envDisplay === 1"
                      :label="envFromFieldIndex === 0 ? '描述字段': ''">
              <Row type="flex" justify="space-between">
                <Col span="7">
                  <FormItem>
                    <Input v-model="item.name">
                      <span slot="prepend">名称</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem>
                    <Input v-model="item.valueFrom.name">
                      <span slot="prepend">版本</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="9">
                  <FormItem>
                    <Input v-model="item.valueFrom.key">
                      <span slot="prepend">字段</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('field',index, envFromFieldIndex)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!--存活探针-->
          <FormItem label="存活探针">
            <i-switch size="large" v-model="formItemConfig.containers[index].livenessProbeDisplay" :true-value=1
                      :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <FormItem v-if="formItemConfig.containers[index].livenessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="12">
                <FormItem>
                  <RadioGroup v-model="formItemConfig.containers[index].livenessProbeType" type="button">
                    <Radio label="httpGet">HTTP GET</Radio>
                    <Radio label="command">Command</Radio>
                    <Radio label="socket">TCP Socket</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- httpGet-->
          <FormItem
            v-if="formItemConfig.containers[index].livenessProbeType === 'httpGet' && formItemConfig.containers[index].livenessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="3">
                <FormItem>
                  <Select v-model="formItemConfig.containers[index].livenessProbeHTTPGet.httpGet.scheme">
                    <Option value="HTTP">HTTP</Option>
                    <Option value="HTTPS">HTTPS</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="15">
                <FormItem
                  :prop="'containers.' + index + '.livenessProbeHTTPGet.httpGet.path'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                  <Input v-model="formItemConfig.containers[index].livenessProbeHTTPGet.httpGet.path">
                    <span slot="prepend">路径</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem
                  :prop="'containers.' + index + '.livenessProbeHTTPGet.httpGet.port'">
                  <Input v-model="formItemConfig.containers[index].livenessProbeHTTPGet.httpGet.port">
                    <span slot="prepend">端口</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            v-if="formItemConfig.containers[index].livenessProbeType === 'httpGet' && formItemConfig.containers[index].livenessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeHTTPGet.initialDelaySeconds">
                    <span slot="prepend">延迟</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeHTTPGet.timeoutSeconds">
                    <span slot="prepend">超时</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeHTTPGet.periodSeconds">
                    <span slot="prepend">探测频率</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeHTTPGet.successThreshold">
                    <span slot="prepend">成功次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeHTTPGet.failureThreshold">
                    <span slot="prepend">失败次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- command-->
          <div
            v-for="(item, livenessProbeCommandIndex) in formItemConfig.containers[index].livenessProbeCommand.exec.command"
            :key="livenessProbeCommandIndex + 'livenessProbe'" :value="item">
            <FormItem
              v-if="formItemConfig.containers[index].livenessProbeType === 'command' && formItemConfig.containers[index].livenessProbeDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="21">
                  <FormItem
                    :prop="'containers.' + index + '.livenessProbeCommand.exec.command.' + livenessProbeCommandIndex + '.key'"
                    :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model="item.key">
                      <span slot="prepend">命令</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('livenessProbeCommand',index, livenessProbeCommandIndex)"
                          :disabled="formItemConfig.containers[index].livenessProbeCommand.exec.command.length === 1"
                          icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleAdd('livenessProbeCommand', index)" icon="md-add">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <FormItem
            v-if="formItemConfig.containers[index].livenessProbeType === 'command' && formItemConfig.containers[index].livenessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeCommand.initialDelaySeconds">
                    <span slot="prepend">延迟</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeCommand.timeoutSeconds">
                    <span slot="prepend">超时</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeCommand.periodSeconds">
                    <span slot="prepend">探测频率</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeCommand.successThreshold">
                    <span slot="prepend">成功次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeCommand.failureThreshold">
                    <span slot="prepend">失败次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- socket-->
          <FormItem
            v-if="formItemConfig.containers[index].livenessProbeType === 'socket' && formItemConfig.containers[index].livenessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="24">
                <FormItem
                  :prop="'containers.' + index + '.livenessProbeTcpSocket.tcpSocket.port'">
                  <Input v-model="formItemConfig.containers[index].livenessProbeTcpSocket.tcpSocket.port">
                    <span slot="prepend">端口</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            v-if="formItemConfig.containers[index].livenessProbeType === 'socket' && formItemConfig.containers[index].livenessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeTcpSocket.initialDelaySeconds">
                    <span slot="prepend">延迟</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeTcpSocket.timeoutSeconds">
                    <span slot="prepend">超时</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeTcpSocket.periodSeconds">
                    <span slot="prepend">探测频率</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeTcpSocket.successThreshold">
                    <span slot="prepend">成功次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].livenessProbeTcpSocket.failureThreshold">
                    <span slot="prepend">失败次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!--#######################-->
          <!--就绪探针-->
          <FormItem label="就绪探针">
            <i-switch size="large" v-model="formItemConfig.containers[index].readinessProbeDisplay" :true-value=1
                      :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <FormItem v-if="formItemConfig.containers[index].readinessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="12">
                <FormItem>
                  <RadioGroup v-model="formItemConfig.containers[index].readinessProbeType" type="button">
                    <Radio label="httpGet">HTTP GET</Radio>
                    <Radio label="command">Command</Radio>
                    <Radio label="socket">TCP Socket</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- httpGet-->
          <FormItem
            v-if="formItemConfig.containers[index].readinessProbeType === 'httpGet' && formItemConfig.containers[index].readinessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="3">
                <FormItem>
                  <Select v-model="formItemConfig.containers[index].readinessProbeHTTPGet.httpGet.scheme">
                    <Option value="HTTP">HTTP</Option>
                    <Option value="HTTPS">HTTPS</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="15">
                <FormItem
                  :prop="'containers.' + index + '.readinessProbeHTTPGet.httpGet.path'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                  <Input v-model="formItemConfig.containers[index].readinessProbeHTTPGet.httpGet.path">
                    <span slot="prepend">路径</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem
                  :prop="'containers.' + index + '.readinessProbeHTTPGet.httpGet.port'">
                  <Input v-model="formItemConfig.containers[index].readinessProbeHTTPGet.httpGet.port">
                    <span slot="prepend">端口</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            v-if="formItemConfig.containers[index].readinessProbeType === 'httpGet' && formItemConfig.containers[index].readinessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeHTTPGet.initialDelaySeconds">
                    <span slot="prepend">延迟</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeHTTPGet.timeoutSeconds">
                    <span slot="prepend">超时</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeHTTPGet.periodSeconds">
                    <span slot="prepend">探测频率</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeHTTPGet.successThreshold">
                    <span slot="prepend">成功次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeHTTPGet.failureThreshold">
                    <span slot="prepend">失败次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- command-->
          <div
            v-for="(item, readinessProbeCommandIndex) in formItemConfig.containers[index].readinessProbeCommand.exec.command"
            :key="readinessProbeCommandIndex + 'readinessProbe'" :value="item">
            <FormItem
              v-if="formItemConfig.containers[index].readinessProbeType === 'command' && formItemConfig.containers[index].readinessProbeDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="21">
                  <FormItem
                    :prop="'containers.' + index + '.readinessProbeCommand.exec.command.' + readinessProbeCommandIndex + '.key'"
                    :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model="item.key">
                      <span slot="prepend">命令</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('readinessProbeCommand',index, readinessProbeCommandIndex)"
                          :disabled="formItemConfig.containers[index].readinessProbeCommand.exec.command.length === 1"
                          icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleAdd('readinessProbeCommand', index)" icon="md-add">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <FormItem
            v-if="formItemConfig.containers[index].readinessProbeType === 'command' && formItemConfig.containers[index].readinessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeCommand.initialDelaySeconds">
                    <span slot="prepend">延迟</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeCommand.timeoutSeconds">
                    <span slot="prepend">超时</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeCommand.periodSeconds">
                    <span slot="prepend">探测频率</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeCommand.successThreshold">
                    <span slot="prepend">成功次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeCommand.failureThreshold">
                    <span slot="prepend">失败次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- socket-->
          <FormItem
            v-if="formItemConfig.containers[index].readinessProbeType === 'socket' && formItemConfig.containers[index].readinessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="24">
                <FormItem
                  :prop="'containers.' + index + '.readinessProbeTcpSocket.tcpSocket.port'">
<!--                  :rules="{required: true, message: '必须是非零数字', pattern:/^\+?[1-9][0-9]*$/ , trigger: 'blur'}">-->
                  <Input v-model="formItemConfig.containers[index].readinessProbeTcpSocket.tcpSocket.port">
                    <span slot="prepend">端口</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            v-if="formItemConfig.containers[index].readinessProbeType === 'socket' && formItemConfig.containers[index].readinessProbeDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeTcpSocket.initialDelaySeconds">
                    <span slot="prepend">延迟</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeTcpSocket.timeoutSeconds">
                    <span slot="prepend">超时</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeTcpSocket.periodSeconds">
                    <span slot="prepend">探测频率</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeTcpSocket.successThreshold">
                    <span slot="prepend">成功次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="formItemConfig.containers[index].readinessProbeTcpSocket.failureThreshold">
                    <span slot="prepend">失败次数</span>
                    <span slot="append">次</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
        </div>
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('formItemConfig')" icon="md-add"></Button>
          </Row>
        </FormItem>
      </Form>
      <!--亲和性
      <Form ref="createFormItemAffinity" v-show="current === 3" :model="formItemAffinity" :label-width="60">
        <FormItem label="亲和性">
          <i-switch size="large" v-model="formItemAffinity.affinityDisplay" :true-value=1 :false-value=0>
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </FormItem>
        <FormItem label="节点亲和性" v-if="formItemAffinity.affinityDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="12">
                <ButtonGroup>
                  <Button @click="handleAdd('hostPathVolume')">要求</Button>
                  <Button @click="handleAdd('secretVolume')">优先</Button>
                </ButtonGroup>
            </Col>
          </Row>
        </FormItem>
        <div v-for="(item, selectorIndex) in formItemAffinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[0].matchExpressions" :key="selectorIndex + 'nodeSelector'" :value="item" v-if="formItemAffinity.affinityDisplay === 1">
          <FormItem  label="要求">
            <Row type="flex" justify="space-between">
              <Col span="5">
                <FormItem>
                  <Input v-model="item.key">
                     <span slot="prepend">匹配条件</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem>
                   <Select v-model="item.type" placeholder="请选择条件">
                    <Option value="In">In</Option>
                    <Option value="NotIn">NotIn</Option>
                    <Option value="Exists">Exists</Option>
                    <Option value="DoesNotExist">DoesNotExist</Option>
                    <Option value="Gt">Gt</Option>
                    <Option value="Lt">Lt</Option>
                    <Option value="charDevice">CharDevice</Option>
                    <Option value="blockDevice">BlockDevice</Option>
                   </Select>
                </FormItem>
              </Col>
              <Col span="9">
                <FormItem>
                   <Input v-model="item.values" placeholder="多个值请用“;”分隔">
                     <span slot="prepend">值</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('nodeAffinityRequired',selectorIndex)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
        </div>
        <div v-for="(item, selectorIndex) in formItemAffinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution" :key="selectorIndex + 'nodeAffinityPreferred'" :value="item" v-if="formItemAffinity.affinityDisplay === 1">
          <FormItem  label="优先">
            <Row type="flex" justify="space-between">
              <Col span="8">
                <FormItem>
                  <Input v-model="item.weight">
                     <span slot="prepend">权重</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem>
                  <Input v-model="item.preference[0].matchExpressions">
                     <span slot="prepend">卷名称</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('secretVolume',selectorIndex)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
        </div>
      </Form>
      -->
      <Form ref="createFormAnnotations" v-show="current === 3" :model="formItemAnnotations" :label-width="55">
        <div v-for="(item, index) in formItemAnnotations.labels" :key="index + 'labels'" :value="item">
          <FormItem :label="'标签'">
            <Row type="flex" justify="space-between">
              <Col span="21">
                <Input v-model="item.key" placeholder="请输入键">
                </Input>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" long @click="handleAdd('labels')" icon="md-add"></Button>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('labels',index)"
                        :disabled="formItemAnnotations.labels.length === 1" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem :key="index">
            <Row type="flex" justify="space-between">
              <Col span="24">
                <Input v-model="item.val" type="textarea" :autosize="{minRows: 1,maxRows: 50}" placeholder="请输入值">
                </Input>
              </Col>
            </Row>
          </FormItem>
        </div>
        <div v-for="(item, index) in formItemAnnotations.items" :key="index + 'annotations'" :value="item">
          <FormItem :label="'注解'">
            <Row type="flex" justify="space-between">
              <Col span="21">
                <Input v-model="item.key" placeholder="请输入键">
                </Input>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" long @click="handleAdd('annotations')" icon="md-add"></Button>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('annotations',index)"
                        :disabled="formItemAnnotations.items.length === 1" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem :key="index">
            <Row type="flex" justify="space-between">
              <Col span="24">
                <Input v-model="item.val" type="textarea" :autosize="{minRows: 1,maxRows: 50}" placeholder="请输入值">
                </Input>
              </Col>
            </Row>
          </FormItem>
        </div>
      </Form>
      <div slot="footer">
        <Button type="primary" v-if="current != 0" @click="previous">{{this.$t('previous')}}</Button>
        <Button type="primary" v-if="current != 3" @click="next">{{this.$t('next')}}</Button>
        <Button type="primary" v-if="current == 3 && option == 'add'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
        <Button type="primary" v-if="current == 3 && option == 'edit'" @click="formOption('EDIT')">{{this.$t('commit')}}</Button>
        <!--        <Button type="primary" ghost v-if="current == 3 && option == 'copy'" @click="formOption('Template')">保存为模板</Button>-->
        <Button type="primary" v-if="current == 3 && option == 'copy'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
      </div>
    </Modal>
    <Modal slot="option" v-model="warmUpShow" :title="optionTitle">
      <Form ref="createFormTemplate" :model="formItemWarmUp" :rules="warmUpRuleValidate" :label-width="56">
        <FormItem :label="this.$t('image')" prop="image">
          <Input v-model="formItemWarmUp.image"></Input>
        </FormItem>
        <FormItem :label="this.$t('node')" prop="node">
          <Select v-model="formItemWarmUp.node"  multiple filterable placeholder="选择节点标签" @on-change="nodeChange(formItemBase.node)">
             <Option v-for="v in node" :value="v.name" :key="v.name">{{ v.name }}</Option>
           </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="warmUpShow = false">{{this.$t('cancel')}}</Button>
        <Button type="primary" @click="fromTemplate()">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { formatDate } from '@/api/tools'
import {
  createController,
  createTemplate,
  deleteController,
  restartController,
  formCreateController,
  getControllerInfo,
  getOneControllerInfo,
  scaleController,
  updateController,
  getNamespaceLabel
} from '@/api/deployment'
import { getAllConfMap, getAllSecret, getOneConfMap, getOneSecret } from '@/api/configuration'
import { getAllNodeData } from '@/api/cluster'
import { List } from '@/api/template'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import SearchTable from '@/view/other-page/search-table.vue'
import { hasPermission } from '@/router/permission'
import { randomString } from '@/libs/tools'

const json2yaml = require('json2yaml')
const yaml2json = require('js-yaml')

export default {
  components: {
    YamlModal,
    SearchTable
  },
  data () {
    const validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        if (this.nameExistCheck) {
          this.data1.forEach((item, index) => {
            if (item.name === value) {
              callback(new Error(this.$t('name_exists')))
            }
          })
        }
        callback()
      }
    }
    const validateNum = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        let reg = /^[0-9]*$/
        if (!reg.test(value)) {
          callback(new Error(this.$t('number')))
        }
        callback()
      }
    }
    const validateRollingUpdate = (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let reg = /^(0|[1-9][0-9]*)(|%)$/
        if (!reg.test(value)) {
          callback(new Error(this.$t('percentage')))
        }
        callback()
      }
    }
    return {
      // warm-up
      warmUpShow: false,
      formItemWarmUp: {
        image: '',
        node: ''
      },
      warmUpRuleValidate: {
        image: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        node: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ]
      },
      // template
      templateShow: false,
      templateDisplay: false,
      template: [],
      formItemTemplate: {
        name: '',
        describe: ''
      },
      templateRuleValidate: {
        name: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        describe: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ]
      },
      // From Add Model
      nodeSelector: [],
      nameDisabled: false,
      deployment: '',
      node: [],
      volumeName: [],
      secret: [],
      secretKey: [],
      configMap: [],
      configMapKey: [],
      formAddModel: false,
      service: [],
      port: [],
      servicePort: {},
      current: 0,
      formItemBase: {
        template: '不使用模板',
        name: '',
        replicasNum: 1,
        type: 'RollingUpdate',
        rollingUpdate: {
          maxUnavailable: '25%',
          maxSurge: '25%'
        },
        istioDisplay: 0,
        isitoDisabled: true,
        nodeDisplay: 0,
        nodeSelectType: 'nodeLabels',
        nodeAssign: '',
        node: '',
        nodeSelector: [],
        labels: [
          {
            val: '',
            key: ''
          }
        ],
        annotations: [
          {
            val: '',
            key: ''
          }
        ]
      },
      formItemVolume: {
        type: 'hostPathVolume',
        volumeDisplay: 0,
        secret: [],
        configMap: [],
        hostPath: [],
        emptyDir: [],
        cephFS: []
      },
      formItemAffinity: {
        affinityDisplay: 0,
        nodeAffinity: {
          requiredDuringSchedulingIgnoredDuringExecution: {
            nodeSelectorTerms: [{
              matchExpressions: [{
                key: '',
                operator: '',
                values: []
              }]
            }]
          },
          preferredDuringSchedulingIgnoredDuringExecution: [{
            weight: '',
            preference: {
              matchExpressions: [{
                key: '',
                operator: '',
                values: []
              }]
            }
          }]
        },
        podAffinity: {
          requiredDuringSchedulingIgnoredDuringExecution: {
            nodeSelectorTerms: [{
              matchExpressions: [{
                key: '',
                operator: '',
                values: []
              }]
            }]
          },
          preferredDuringSchedulingIgnoredDuringExecution: [{
            weight: '',
            preference: {
              matchExpressions: [{
                key: '',
                operator: '',
                values: []
              }]
            }
          }]
        }
      },
      formItemConfig: {
        containers: [{
          containersType: 'containers',
          name: '',
          image: '',
          imagePullPolicy: 'IfNotPresent',
          portsDisplay: 0,
          ports: [{
            name: '',
            containerPort: '',
            protocol: 'TCP'
          }],
          volumeMountDisplay: 0,
          volumeMounts: [{
            name: '',
            readOnly: '',
            mountPath: ''
          }],
          resourcesDisplay: 0,
          privileged: 0,
          resources: {
            requests: {
              cpu: '',
              memory: '',
              cpuUnit: 'core',
              memoryUnit: 'Mi'
            },
            limits: {
              cpu: '',
              memory: '',
              cpuUnit: 'core',
              memoryUnit: 'Mi'
            }
          },
          commandDisplay: 0,
          command: [],
          args: [],
          envDisplay: 0,
          env: [],
          envFromSecret: [],
          envFromConfigMap: [],
          envFromField: [],
          healthCheckDisplay: 0,
          livenessProbeDisplay: 0,
          readinessProbeDisplay: 0,
          livenessProbeType: 'httpGet',
          livenessProbeCommand: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            exec: {
              command: [{
                'key': ''
              }]
            }
          },
          livenessProbeHTTPGet: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            httpGet: {
              'path': '',
              'port': '',
              'scheme': 'HTTP'
            }
          },
          livenessProbeTcpSocket: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            tcpSocket: {
              'port': ''
            }
          },
          readinessProbeType: 'httpGet',
          readinessProbeCommand: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            exec: {
              command: [{
                'key': ''
              }]
            }
          },
          readinessProbeHTTPGet: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            httpGet: {
              'path': '',
              'port': '',
              'scheme': 'HTTP'
            }
          },
          readinessProbeTcpSocket: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            tcpSocket: {
              'port': ''
            }
          },
          serviceAccount: ''
        }]
      },
      formItemAnnotations: {
        items: [
          {
            val: '',
            key: ''
          }
        ],
        labels: [
          {
            val: '',
            key: ''
          }
        ]
      },
      ruleValidate: {
        name: [
          { validator: validateName, trigger: 'blur' }
        ],
        replicasNum: [
          { validator: validateNum, trigger: 'blur' }
        ],
        'rollingUpdate.maxUnavailable': [
          { validator: validateRollingUpdate, trigger: 'blur' }
        ],
        'rollingUpdate.maxSurge': [
          { validator: validateRollingUpdate, trigger: 'blur' }
        ],
        'labels[0].key': [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ]
      },
      // Advanced Add Model End
      replicas: 0,
      deleteModel: false,
      restartModel: false,
      restartLoading: false,
      scaleModel: false,
      deleteLoading: false,
      setArray: {
        deployment: 1,
        daemonset: 2,
        statefulset: 3
      },
      ctrl: '',
      setName: '',
      option: '',
      optionTitle: '',
      yamlType: 'success',
      jsonType: 'default',
      JsonFormat: false,
      YamlFormat: true,
      editorLang: 'yaml',
      editorContent: '',
      editShow: false,
      updateYaml: '',
      originYaml: '',
      data1: [],
      data2: [],
      data3: [],
      columns: [
        {
          title: this.$t('name'),
          key: 'name',
          render: (h, params) => {
            return h(
              'router-link',
              {
                props: {
                  to: {
                    name: 'deploymentinfo',
                    params: {
                      setName: params.row.setName,
                      ctrl: params.row.name,
                      uid: params.row.uid
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: this.$t('label'),
          key: 'labels',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.labels).map(item => {
                return h(
                  'Tag',
                  {
                    style: {
                      textAlign: 'center'
                    },
                    props: {
                      color: 'success'
                    }
                  },
                  item + ' | ' + params.row.labels[item]
                )
              })
            )
          }
        },
        {
          title: this.$t('pod'),
          key: 'conPercent',
          width: 150,
          render: (h, params) => {
            return h(
              'Tag',
              {
                style: {
                  textAlign: 'center'
                },
                props: {
                  color: params.row.conPercent.split('/')[0] !== '0 ' ? 'warning' : 'success'
                }
              },
              params.row.conPercent
            )
          }
        },
        {
          title: this.$t('image'),
          key: 'image'
        },
        {
          title: this.$t('update_time'),
          key: 'update_time',
          width: 150,
          render: (h, params) => {
            return h('div', params.row.update_time)
          }
        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          width: 150,
          sortable: true,
          sortType: 'desc',
          render: (h, params) => {
            return h('div', formatDate(params.row.create_time))
          }
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 235,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    ghost: true,
                    disabled: !hasPermission('edit_dep')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.$refs['createFormItem'].resetFields()
                      this.$refs['createFormItemConfig'].resetFields()
                      this.current = 0
                      this.optionTitle = this.$t('edit') + ' ' + params.row.name
                      this.option = 'edit'
                      this.formAddModel = true
                      this.nameExistCheck = false
                      this.ctrl = params.row.name
                      this.setName = params.row.setName
                      this.templateDisplay = false
                      this.formEdit()
                    }
                  }
                },
                this.$t('edit')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: !hasPermission('a_edit_dep')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.yamlType = 'success'
                      this.jsonType = 'default'
                      this.updateYaml = ''
                      this.originYaml = ''
                      this.editShow = true
                      this.optionTitle = this.$t('edit')
                      this.option = 'edit'
                      this.ctrl = params.row.name
                      this.setName = params.row.setName
                      this.edit()
                    }
                  }
                },
                this.$t('advanced_edit')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    ghost: true,
                    disabled: !hasPermission('scale_dep')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.scaleModel = true
                      this.optionTitle = '伸缩 ' + params.row.name
                      this.replicas = params.row.replicas
                      this.resourceName = params.row.id
                      this.setName = params.row.setName
                      this.ctrl = params.row.name
                    }
                  }
                },
                this.$t('scale')
              ),
              // h(
              //   'Button',
              //   {
              //     props: {
              //       type: 'primary',
              //       size: 'small',
              //       disabled: !hasPermission('copy_dep')
              //     },
              //     style: {
              //       marginRight: '3px'
              //     },
              //     on: {
              //       click: () => {
              //         this.current = 0
              //         this.optionTitle = '复制 ' + params.row.name
              //         this.option = 'copy'
              //         this.formAddModel = true
              //         this.nameExistCheck = false
              //         this.ctrl = params.row.name
              //         this.setName = params.row.setName
              //         this.formEdit()
              //       }
              //     }
              //   },
              //   this.$t('copy')
              // ),
              // h(
              //   'Button',
              //   {
              //     props: {
              //       type: 'error',
              //       size: 'small',
              //       disabled: !hasPermission('del_dep')
              //     },
              //     on: {
              //       click: () => {
              //         this.deleteModel = true
              //         this.deleteLoading = false
              //         this.resourceName = params.row.id
              //         this.setName = params.row.setName
              //         this.ctrl = params.row.name
              //       }
              //     }
              //   },
              //   this.$t('delete')
              // ),
              h('Dropdown', {
                props: {
                  placement: 'bottom-end',
                  transfer: true
                }
              }, [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  }
                }, this.$t('more')),
                h('DropdownMenu', {
                  slot: 'list'
                }, [
                  h('DropdownItem', {
                    props: {
                      disabled: !hasPermission('restart_dep')
                    },
                    nativeOn: {
                      click: () => {
                        if (hasPermission('restart_dep')) {
                          this.restartModel = true
                          this.restartLoading = false
                          this.resourceName = params.row.id
                          this.setName = params.row.setName
                          this.ctrl = params.row.name
                        }
                      }
                    }
                  }, this.$t('restart')),
                  h('DropdownItem', {
                    props: {
                      disabled: !hasPermission('copy_dep')
                    },
                    nativeOn: {
                      click: () => {
                        if (hasPermission('copy_dep')) {
                          this.current = 0
                          this.optionTitle = this.$t('copy') + ' ' + params.row.name
                          this.option = 'copy'
                          this.formAddModel = true
                          this.nameExistCheck = false
                          this.ctrl = params.row.name
                          this.setName = params.row.setName
                          this.templateDisplay = false
                          this.formEdit()
                        }
                      }
                    }
                  }, this.$t('copy')),
                  h('DropdownItem', {
                    props: {
                      disabled: !hasPermission('save_tem_dep')
                    },
                    nativeOn: {
                      click: () => {
                        if (hasPermission('save_tem_dep')) {
                          this.optionTitle = this.$t('save_template') + ' ' + params.row.name
                          this.templateShow = true
                          this.ctrl = params.row.name
                          this.setName = params.row.setName
                        }
                      }
                    }
                  }, this.$t('save_template')),
                  h('DropdownItem', {
                    props: {
                      disabled: !hasPermission('warm_up')
                    },
                    nativeOn: {
                      click: () => {
                        if (hasPermission('warm_up')) {
                          this.optionTitle = this.$t('warm_up') + ' ' + params.row.name
                          this.warmUpShow = true
                          this.ctrl = params.row.name
                          this.setName = params.row.setName
                        }
                      }
                    }
                  }, this.$t('warm_up')),
                  h('DropdownItem', {
                    props: {
                      disabled: !hasPermission('del_dep'),
                      divided: true
                    },
                    nativeOn: {
                      click: () => {
                        if (hasPermission('del_dep')) {
                          this.deleteModel = true
                          this.deleteLoading = false
                          this.resourceName = params.row.id
                          this.setName = params.row.setName
                          this.ctrl = params.row.name
                        }
                      }
                    }
                  }, this.$t('delete'))
                ])
              ])
            ])
          }
        }
      ]
    }
  },
  computed: {
    formItemBaseName () {
      return this.formItemBase.name
    }
  },
  watch: {
    // 添加的时候监听部署名的变化自动生成容器名,编辑的时候不生效
    formItemBaseName (newValue, oldValue) {
      if (this.option === 'add' || this.option === 'copy') {
        this.formItemConfig.containers.forEach((item, index) => {
          this.formItemConfig.containers[index].name = newValue + '-' + randomString(6)
        })
        this.formItemBase.labels = []
        this.formItemBase.labels.push({
          val: newValue,
          key: 'app'
        })
      }
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
    this.formatTableData()
    this.getNode()
    // if (this.timer) {
    //   clearInterval(this.timer)
    // } else {
    //   this.timer = setInterval(() => {
    //     this.formatTableData()
    //   }, 5 * 1000)
    // }
  },
  // 关闭页面后停止刷新
  // destroyed () {
  //   clearInterval(this.timer)
  // },
  methods: {
    // yaml转json
    json () {
      this.yamlType = 'default'
      this.jsonType = 'success'
      this.editorLang = 'json'
      this.editorContent = yaml2json.load(this.updateYaml)
    },
    // json转yaml
    yaml () {
      // 如果已经是yaml文件不在执行格式化
      if (this.yamlType !== 'success') {
        this.yamlType = 'success'
        this.jsonType = 'default'
        this.editorLang = 'yaml'
        this.editorContent = json2yaml.stringify(JSON.parse(this.updateYaml))
      }
    },
    edit () {
      this.editorContent = this.updateYaml
      getOneControllerInfo({
        productId: 100,
        setName: this.setName,
        ctrl: this.ctrl
      }).then(res => {
        this.type = 'success'
        this.originYaml = res.data
        this.editorLang = 'yaml'
        this.editorContent = json2yaml.stringify(this.originYaml)
      })
    },
    // 监听子组件的change事件
    change (content) {
      this.updateYaml = content
    },
    update () {
      let updateJson = ''
      if (this.option === 'edit') {
        try {
          // updateJson = JSON.parse(this.updateYaml)
          updateJson = yaml2json.load(this.updateYaml)
        } catch (e) {
          this.$Message.error({
            content: '格式不对'
          })
          return
        }
        this.editorContent = this.updateYaml
        updateController({
          productId: 100,
          updateJson: updateJson,
          setName: this.setName,
          postType: 'yaml'
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.formatTableData()
            this.$Message.success({
              content: this.$t('edit_success')
            })
            this.editShow = false
          }
        })
      } else {
        if (this.updateYaml) {
          createController({
            productId: 100,
            setName: this.setName,
            yaml: JSON.stringify(this.updateYaml)
          }).then(res => {
            if (res.code === 200 && res.msg === '') {
              this.formatTableData()
              this.$Message.success({
                content: this.$t('create_success')
              })
              this.editShow = false
            }
          })
        } else {
          this.$Message.error({
            content: '添加的内容为空'
          })
        }
      }
    },
    advancedCreateBtnClick () {
      this.yamlType = 'success'
      this.jsonType = 'default'
      this.updateYaml = ''
      this.originYaml = ''
      this.editorContent = ''
      this.ctrl = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.editShow = true
    },
    formatTableData () {
      this.getTableData('deployment', this.setArray['deployment'])
      this.getTableData('daemonset', this.setArray['daemonset'])
      this.getTableData('statefulset', this.setArray['statefulset'])
    },
    scale () {
      scaleController({
        productId: 100,
        setName: this.setName,
        ctrl: this.ctrl,
        scale: this.replicas
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.formatTableData()
          this.scaleModel = false
        }
      })
    },
    del () {
      this.deleteLoading = true
      deleteController({
        productId: 100,
        setName: this.setName,
        ctrl: this.ctrl
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.formatTableData()
          this.deleteLoading = false
          this.deleteModel = false
        } else {
          this.deleteLoading = false
        }
      })
    },
    restart () {
      this.restartLoading = true
      restartController({
        productId: 100,
        setName: this.setName,
        ctrl: this.ctrl
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.formatTableData()
          this.restartLoading = false
          this.restartModel = false
        } else {
          this.restartLoading = false
        }
      })
    },
    getTableData (setName, dataset) {
      getControllerInfo({
        productId: 100,
        setName: setName
      }).then(res => {
        let data = []
        res.data.forEach((item, index) => {
          let updateTime = ''
          let progressing = 0
          let available = 0
          let conPercent = '0 / 0 / 0'
          if (item.status.conditions) {
            item.status.conditions.forEach((conditions, i) => {
              if (conditions.type === 'Progressing') {
                progressing = Date.parse(formatDate(conditions.lastUpdateTime))
              }
              if (conditions.type === 'Available') {
                available = Date.parse(formatDate(conditions.lastUpdateTime))
              }
              if (available > progressing) {
                updateTime = available
              } else {
                updateTime = progressing
              }
            })
          }
          if (setName === 'deployment') {
            conPercent = (item.status.unavailableReplicas || '0') + ' / ' + (item.status.readyReplicas || '0') + ' / ' + (item.spec.replicas || '0')
          }
          if (setName === 'statefulset') {
            conPercent = (item.status.replicas - item.status.readyReplicas) + ' / ' + (item.status.readyReplicas || '0') + ' / ' + (item.spec.replicas || '0')
          }
          if (setName === 'daemonset') {
            conPercent = (item.status.desiredNumberScheduled - item.status.numberReady) + ' / ' + (item.status.numberReady || '0') + ' / ' + (item.status.desiredNumberScheduled || '0')
          }
          data.push({
            setName: setName,
            uid: item.metadata.uid,
            name: item.metadata.name,
            conPercent: conPercent,
            labels: item.metadata.labels || {},
            image: item.spec.template.spec.containers[0].image,
            create_time: item.metadata.creationTimestamp,
            update_time: updateTime ? formatDate(updateTime) : updateTime,
            status: item.status,
            replicas: item.spec.replicas
          })
        })
        this['data' + dataset] = data
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    },
    // 表单添加
    createBtnClick () {
      this.$refs['createFormItem'].resetFields()
      this.$refs['createFormItemConfig'].resetFields()
      this.handleReset()
      this.nameExistCheck = true
      this.current = 0
      this.ingressName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.formAddModel = true
      this.nameDisabled = false
      this.templateDisplay = true
      this.namespaceLabel('istio')
      this.getNode()
      this.getTemplate()
      this.getSecret()
      this.getConfigMap()
    },
    namespaceLabel (value) {
      getNamespaceLabel({
        productId: 100,
        label: value
      }).then(res => {
        this.formItemBase.isitoDisabled = !res.data
        this.formItemBase.istioDisplay = res.data ? 1 : 0
      })
    },
    getNode () {
      this.node = []
      this.nodeSelector = []
      getAllNodeData({
        productId: 100
      }).then(res => {
        res.data.forEach((item, index) => {
          // 去除master
          let masterNode = false
          Object.keys(item.metadata.labels).map(item => {
            if (item === 'node-role.kubernetes.io/master') {
              masterNode = true
            }
          })
          if (!masterNode) {
            delete item.metadata.labels['beta.kubernetes.io/arch']
            delete item.metadata.labels['beta.kubernetes.io/os']
            delete item.metadata.labels['kubernetes.io/arch']
            delete item.metadata.labels['kubernetes.io/os']
            delete item.metadata.labels['kubernetes.io/hostname']
            Object.keys(item.metadata.labels).map(label => {
              let exist = false
              this.nodeSelector.forEach((l, index) => {
                if (l['key'] === label && l['val'] === item.metadata.labels[label]) {
                  exist = true
                }
              })
              if (!exist) {
                this.nodeSelector.push(
                  {
                    'key': label,
                    'val': item.metadata.labels[label]
                  }
                )
              }
            })
            this.node.push({
              name: item.metadata.name
              // labels: item.metadata.labels
            })
          }
        })
      })
    },
    nodeChange (value) {
      this.node.forEach((item, index) => {
        if (value === item.name) {
          this.formItemBase.nodeSelector = []
          for (const k in item.labels) {
            this.formItemBase.nodeSelector.push(
              {
                'key': k,
                'val': item.labels[k]
              }
            )
          }
        }
      })
    },
    getTemplate () {
      this.formItemBase.template = '不使用模板'
      this.template = [{
        'name': '不使用模板'
      }]
      List({
        productId: 100
      }).then(res => {
        res.data.forEach((item, index) => {
          if (item.kind === 'deployment') {
            this.template.push({
              name: item.name,
              spec: item.spec
            })
          }
        })
      })
    },
    templateChange (value) {
      if (value === '不使用模板') {
        this.handleReset()
      } else {
        this.template.forEach((item, index) => {
          if (item.spec && value === item.name) {
            this.formEditTemplate(item.spec)
          }
        })
      }
    },
    getSecret () {
      this.secret = []
      getAllSecret({
        productId: 100
      }).then(res => {
        res.data.forEach((item, index) => {
          this.secret.push({
            name: item.metadata.name
          })
        })
      })
    },
    getConfigMap () {
      this.configMap = []
      getAllConfMap({
        productId: 100
      }).then(res => {
        res.data.forEach((item, index) => {
          this.configMap.push({
            name: item.metadata.name
          })
        })
      })
    },
    getKeyByConfigMap (name) {
      this.configMapKey = []
      getOneConfMap({
        productId: 100,
        confmap: name
      }).then(res => {
        for (let key in res.data.data) {
          this.configMapKey.push(key)
        }
      })
    },
    getKeyBySecret (name) {
      this.secretKey = []
      getOneSecret({
        productId: 100,
        secret: name
      }).then(res => {
        for (let key in res.data.data) {
          this.secretKey.push(key)
        }
      })
    },
    // 都删除了按钮显示关闭
    hideEnv (index) {
      if (this.formItemConfig.containers[index].envFromField.length === 0 &&
        this.formItemConfig.containers[index].envFromSecret.length === 0 &&
        this.formItemConfig.containers[index].envFromConfigMap.length === 0 &&
        this.formItemConfig.containers[index].env.length === 0) {
        this.formItemConfig.containers[index].envDisplay = 0
      }
    },
    hideVolume () {
      if (this.formItemVolume.secret.length === 0 &&
        this.formItemVolume.configMap.length === 0 &&
        this.formItemVolume.hostPath.length === 0 &&
        this.formItemVolume.cephFS.length === 0 &&
        this.formItemVolume.emptyDir.length === 0) {
        this.formItemVolume.volumeDisplay = 0
      }
    },
    hideCommandAndArgs (index) {
      if (this.formItemConfig.containers[index].command.length === 0 &&
        this.formItemConfig.containers[index].args.length === 0) {
        this.formItemConfig.containers[index].commandDisplay = 0
      }
    },
    next () {
      if (this.current === 0) {
        this.$refs['createFormItem'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      } else if (this.current === 1) {
        this.$refs['createFormItemVolume'].validate(valid => {
          if (valid) {
            this.current += 1
            // 获取卷名
            this.volumeName = []
            this.formItemVolume.hostPath.forEach((item, index) => {
              if (item.name) {
                this.volumeName.push({
                  name: item.name,
                  type: '主机目录'
                })
              }
            })
            this.formItemVolume.secret.forEach((item, index) => {
              if (item.name) {
                this.volumeName.push({
                  name: item.name,
                  type: '保密字典'
                })
              }
            })
            this.formItemVolume.configMap.forEach((item, index) => {
              if (item.name) {
                this.volumeName.push({
                  name: item.name,
                  type: '配置字典'
                })
              }
            })
            this.formItemVolume.cephFS.forEach((item, index) => {
              if (item.name) {
                this.volumeName.push({
                  name: item.name,
                  type: 'CephFS'
                })
              }
            })
            this.formItemVolume.emptyDir.forEach((item, index) => {
              if (item.name) {
                this.volumeName.push({
                  name: item.name,
                  type: '空目录'
                })
              }
            })
          }
        })
      } else if (this.current === 2) {
        this.$refs['createFormItemConfig'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      }
    },
    previous () {
      this.current -= 1
    },
    handleRemove (type, index, secondIndex) {
      if (type === 'podLabels') {
        this.formItemBase.labels.splice(index, 1)
      }
      if (type === 'podAnnotations') {
        this.formItemBase.annotations.splice(index, 1)
      }
      if (type === 'secretVolume') {
        this.formItemVolume.secret.splice(index, 1)
        this.hideVolume()
      }
      if (type === 'configMapVolume') {
        this.formItemVolume.configMap.splice(index, 1)
        this.hideVolume()
      }
      if (type === 'hostPathVolume') {
        this.formItemVolume.hostPath.splice(index, 1)
        this.hideVolume()
      }
      if (type === 'cephFSVolume') {
        this.formItemVolume.cephFS.splice(index, 1)
        this.hideVolume()
      }
      if (type === 'emptyDirVolume') {
        this.formItemVolume.emptyDir.splice(index, 1)
        this.hideVolume()
      }
      if (type === 'ports') {
        this.formItemConfig.containers[index].ports.splice(secondIndex, 1)
        if (this.formItemConfig.containers[index].ports.length === 0) {
          this.formItemConfig.containers[index].portsDisplay = 0
        }
      }
      if (type === 'volumeMount') {
        this.formItemConfig.containers[index].volumeMounts.splice(secondIndex, 1)
        if (this.formItemConfig.containers[index].volumeMounts.length === 0) {
          this.formItemConfig.containers[index].volumeMountDisplay = 0
        }
      }
      if (type === 'command') {
        this.formItemConfig.containers[index].command.splice(secondIndex, 1)
        this.hideCommandAndArgs(index)
      }
      if (type === 'args') {
        this.formItemConfig.containers[index].args.splice(secondIndex, 1)
        this.hideCommandAndArgs(index)
      }
      if (type === 'env') {
        this.formItemConfig.containers[index].env.splice(secondIndex, 1)
        this.hideEnv(index)
      }
      if (type === 'configMap') {
        this.formItemConfig.containers[index].envFromConfigMap.splice(secondIndex, 1)
        this.hideEnv(index)
      }
      if (type === 'secret') {
        this.formItemConfig.containers[index].envFromSecret.splice(secondIndex, 1)
        this.hideEnv(index)
      }
      if (type === 'field') {
        this.formItemConfig.containers[index].envFromField.splice(secondIndex, 1)
        this.hideEnv(index)
      }
      if (type === 'readinessProbeCommand') {
        this.formItemConfig.containers[index].readinessProbeCommand.exec.command.splice(secondIndex, 1)
      }
      if (type === 'livenessProbeCommand') {
        this.formItemConfig.containers[index].livenessProbeCommand.exec.command.splice(secondIndex, 1)
      }
      if (type === 'formItemConfig') {
        this.formItemConfig.containers.splice(index, 1)
      }
      if (type === 'formItemRouterPath') {
        this.formItemRouter.items[index].paths.splice(secondIndex, 1)
      }
      if (type === 'annotations') {
        this.formItemAnnotations.items.splice(index, 1)
      }
      if (type === 'labels') {
        this.formItemAnnotations.labels.splice(index, 1)
      }
    },
    handleAdd (type, index, tag, secondIndex) {
      if (type === 'podLabels') {
        this.formItemBase.labels.push({
          val: '',
          key: ''
        })
      }
      if (type === 'podAnnotations') {
        this.formItemBase.annotations.push({
          val: '',
          key: ''
        })
      }
      if (type === 'secretVolume') {
        this.formItemVolume.secret.push({
          name: '',
          secretName: '',
          defaultMode: 644
          // optional: true
        })
      }
      if (type === 'configMapVolume') {
        this.formItemVolume.configMap.push({
          name: '',
          configMapName: '',
          defaultMode: 644
          // optional: true
        })
      }
      if (type === 'hostPathVolume') {
        this.formItemVolume.hostPath.push({
          name: '',
          path: '',
          type: 'none'
        })
      }
      if (type === 'cephFSVolume') {
        this.formItemVolume.cephFS.push({
          name: '',
          path: '',
          user: '',
          monitors: '',
          secretRef: {
            name: ''
          }
        })
      }
      if (type === 'emptyDir') {
        this.formItemVolume.emptyDir.push({
          name: '',
          emptyDir: {
            medium: 'Empty'
          }
        })
      }
      if (type === 'portsAdd') {
        if (this.formItemConfig.containers[index].portsDisplay === 1 && this.formItemConfig.containers[index].ports.length === 0) {
          this.formItemConfig.containers[index].ports.push({
            name: '',
            containerPort: '',
            protocol: 'TCP'
          })
        }
      }
      if (type === 'ports') {
        this.formItemConfig.containers[index].ports.push({
          name: '',
          containerPort: '',
          protocol: 'TCP'
        })
      }
      if (type === 'volumeMountAdd') {
        if (this.formItemConfig.containers[index].volumeMountDisplay === 1 && this.formItemConfig.containers[index].volumeMounts.length === 0) {
          this.formItemConfig.containers[index].volumeMounts.push({
            name: '',
            readOnly: '',
            mountPath: ''
          })
        }
      }
      if (type === 'volumeMount') {
        this.formItemConfig.containers[index].volumeMounts.push({
          name: '',
          readOnly: '',
          mountPath: ''
        })
      }
      if (type === 'command') {
        this.formItemConfig.containers[index].command.push({
          'key': ''
        })
      }
      if (type === 'args') {
        this.formItemConfig.containers[index].args.push({
          'key': ''
        })
      }
      if (type === 'env') {
        this.formItemConfig.containers[index].env.push({
          'name': '',
          'value': ''
        })
      }
      if (type === 'configMap') {
        this.formItemConfig.containers[index].envFromConfigMap.push({
          'name': '',
          'valueFrom': {
            'name': '',
            'key': ''
          }
        })
      }
      if (type === 'secret') {
        this.formItemConfig.containers[index].envFromSecret.push({
          'name': '',
          'valueFrom': {
            'name': '',
            'key': ''
          }
        })
      }
      if (type === 'field') {
        this.formItemConfig.containers[index].envFromField.push({
          'name': '',
          'valueFrom': {
            'name': '',
            'key': ''
          }
        })
      }
      if (type === 'readinessProbeCommand') {
        this.formItemConfig.containers[index].readinessProbeCommand.exec.command.push(
          {
            key: ''
          }
        )
      }
      if (type === 'livenessProbeCommand') {
        this.formItemConfig.containers[index].livenessProbeCommand.exec.command.push(
          {
            key: ''
          }
        )
      }
      if (type === 'formItemConfig') {
        this.formItemConfig.containers.push({
          containersType: 'containers',
          name: this.formItemBase.name + '-' + randomString(6),
          image: '',
          imagePullPolicy: 'IfNotPresent',
          portsDisplay: 0,
          ports: [{
            name: '',
            containerPort: '',
            protocol: 'TCP'
          }],
          volumeMountDisplay: 0,
          volumeMounts: [{
            name: '',
            readOnly: '',
            mountPath: ''
          }],
          resourcesDisplay: 0,
          privileged: 0,
          resources: {
            requests: {
              cpu: '',
              memory: '',
              cpuUnit: 'core',
              memoryUnit: 'Mi'
            },
            limits: {
              cpu: '',
              memory: '',
              cpuUnit: 'core',
              memoryUnit: 'Mi'
            }
          },
          commandDisplay: 0,
          command: [],
          args: [],
          envDisplay: 0,
          env: [],
          envFromSecret: [],
          envFromConfigMap: [],
          envFromField: [],
          healthCheckDisplay: 0,
          livenessProbeDisplay: 0,
          readinessProbeDisplay: 0,
          livenessProbeType: 'httpGet',
          livenessProbeCommand: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            exec: {
              command: [{
                'key': ''
              }]
            }
          },
          livenessProbeHTTPGet: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            httpGet: {
              'path': '',
              'port': '',
              'scheme': 'HTTP'
            }
          },
          livenessProbeTcpSocket: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            tcpSocket: {
              'port': ''
            }
          },
          readinessProbeType: 'httpGet',
          readinessProbeCommand: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            exec: {
              command: [{
                'key': ''
              }]
            }
          },
          readinessProbeHTTPGet: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            httpGet: {
              'path': '',
              'port': '',
              'scheme': 'HTTP'
            }
          },
          readinessProbeTcpSocket: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            tcpSocket: {
              'port': ''
            }
          }
        })
      }
      if (type === 'annotations') {
        this.formItemAnnotations.items.push({
          val: '',
          key: ''
        })
      }
      if (type === 'labels') {
        this.formItemAnnotations.labels.push({
          val: '',
          key: ''
        })
      }
    },
    formOption (value) {
      let json = {}
      if (value === 'CREATE') {
        json = {
          'kind': 'Deployment',
          'apiVersion': 'apps/v1',
          'metadata': {
            'name': this.formItemBase.name,
            'labels': {},
            'annotations': {}
          },
          'spec': {
            'replicas': parseInt(this.formItemBase.replicasNum),
            'selector': {
              'matchLabels': {}
            },
            'template': {
              'metadata': {
                'labels': {},
                'annotations': {}
              },
              'spec': {
                'volumes': [],
                'containers': [],
                'initContainers': [],
                'nodeSelector': {},
                'nodeName': ''
              }
            },
            'strategy': {},
            'revisionHistoryLimit': 10,
            'progressDeadlineSeconds': 600
          }
        }
      }
      if (value === 'EDIT') {
        json = JSON.parse(JSON.stringify(this.deployment))
        json.metadata = {
          'name': this.formItemBase.name,
          'labels': {},
          'annotations': {}
        }
        json.spec.replicas = parseInt(this.formItemBase.replicasNum)
        json.spec.template.metadata = {
          'labels': {},
          'annotations': {}
        }
        json.spec.template.spec.volumes = []
        json.spec.template.spec.containers = []
        json.spec.template.spec.initContainers = []
        json.spec.template.spec.nodeSelector = {}
        json.spec.template.spec.nodeName = ''
        json.spec.strategy = {}
      }
      if (this.formItemBase.labels.length > 0) {
        this.formItemBase.labels.forEach((item, index) => {
          if (item.key) {
            json.spec.template.metadata.labels[item.key] = item.val
            json.spec.selector.matchLabels[item.key] = item.val
            json.metadata.labels[item.key] = item.val
          }
        })
      } else {
        json.spec.template.metadata.labels['app'] = this.formItemBase.name
        json.spec.selector.matchLabels['app'] = this.formItemBase.name
        json.metadata.labels['app'] = this.formItemBase.name
      }
      if (this.formItemBase.nodeDisplay === 1 && this.formItemBase.nodeSelectType === 'nodeLabels') {
        this.formItemBase.nodeSelector.forEach((item, index) => {
          let nodeSelector = item.split(':')
          if (nodeSelector) {
            json.spec.template.spec.nodeSelector[nodeSelector[0]] = nodeSelector[1]
          }
        })
      }
      if (this.formItemBase.nodeDisplay === 1 && this.formItemBase.nodeSelectType === 'nodeAssign') {
        json.spec.template.spec.nodeName = this.formItemBase.nodeAssign
      }
      // 滚动更新策略
      if (this.formItemBase.type === 'RollingUpdate') {
        let maxSurge = '25%'
        let maxUnavailable = '25%'
        if (typeof this.formItemBase.rollingUpdate.maxSurge === 'string' && this.formItemBase.rollingUpdate.maxSurge.indexOf('%') > 0) {
          maxSurge = this.formItemBase.rollingUpdate.maxSurge
        } else {
          maxSurge = parseInt(this.formItemBase.rollingUpdate.maxSurge)
        }
        if (typeof this.formItemBase.rollingUpdate.maxUnavailable === 'string' && this.formItemBase.rollingUpdate.maxUnavailable.indexOf('%') > 0) {
          maxUnavailable = this.formItemBase.rollingUpdate.maxUnavailable
        } else {
          maxUnavailable = parseInt(this.formItemBase.rollingUpdate.maxUnavailable)
        }
        json.spec.strategy = {
          rollingUpdate: {
            maxUnavailable: maxUnavailable,
            maxSurge: maxSurge
          }
        }
      } else {
        json.spec.strategy = {
          type: this.formItemBase.type
        }
      }
      if (this.formItemBase.annotations.length > 0) {
        this.formItemBase.annotations.forEach((item, index) => {
          if (item.key) {
            json.spec.template.metadata.annotations[item.key] = item.val
          }
        })
      }
      if (this.formItemBase.isitoDisabled === false) {
        if (this.formItemBase.istioDisplay === 0) {
          json.spec.template.metadata.annotations['sidecar.istio.io/inject'] = 'false'
        } else {
          delete json.spec.template.metadata.annotations['sidecar.istio.io/inject']
        }
      }
      if (this.formItemVolume.volumeDisplay === 1) {
        if (this.formItemVolume.configMap.length > 0) {
          this.formItemVolume.configMap.forEach((item, index) => {
            json.spec.template.spec.volumes.push({
              'name': item.name,
              'configMap': {
                'name': item.configMapName,
                'defaultMode': parseInt(item.defaultMode, 8)
              }
            })
          })
        }
        if (this.formItemVolume.secret.length > 0) {
          this.formItemVolume.secret.forEach((item, index) => {
            json.spec.template.spec.volumes.push({
              'name': item.name,
              'secret': {
                'secretName': item.secretName,
                'defaultMode': parseInt(item.defaultMode, 8)
              }
            })
          })
        }
        if (this.formItemVolume.hostPath.length > 0) {
          this.formItemVolume.hostPath.forEach((item, index) => {
            json.spec.template.spec.volumes.push({
              'name': item.name,
              'hostPath': {
                'path': item.path,
                'type': item.type === 'none' ? '' : item.type
              }
            })
          })
        }
        if (this.formItemVolume.cephFS.length > 0) {
          this.formItemVolume.cephFS.forEach((item, index) => {
            json.spec.template.spec.volumes.push({
              'name': item.name,
              'cephfs': {
                'monitors': item.monitors.split(';'),
                'path': item.path,
                'user': item.user,
                'secretRef': {
                  'name': item.secretRef.name
                }
              }
            })
          })
        }
        if (this.formItemVolume.emptyDir.length > 0) {
          this.formItemVolume.emptyDir.forEach((item, index) => {
            json.spec.template.spec.volumes.push({
              'name': item.name,
              'emptyDir': {
                'medium': item.emptyDir.medium === 'Empty' ? '' : item.emptyDir.medium
              }
            })
          })
        }
      }
      this.formItemConfig.containers.forEach((item, index) => {
        // ports
        let ports = []
        if (item.portsDisplay === 1 && item.ports) {
          item.ports.forEach((item, index) => {
            ports.push({
              name: item.name,
              containerPort: parseInt(item.containerPort),
              protocol: item.protocol
            })
          })
        }
        let volumeMounts = []
        if (item.volumeMountDisplay === 1 && item.volumeMounts.length > 0) {
          item.volumeMounts.forEach((item, index) => {
            let readOnly = true
            if (item.readOnly === 'false') {
              readOnly = false
            }
            volumeMounts.push({
              name: item.name,
              readOnly: readOnly,
              mountPath: item.mountPath
            })
          })
        }
        // 资源限制
        let resources = {}
        if (item.resourcesDisplay === 1) {
          resources = {
            requests: {
              cpu: item.resources.requests.cpu + (item.resources.requests.cpuUnit === 'core' ? '' : item.resources.requests.cpuUnit),
              memory: item.resources.requests.memory + item.resources.requests.memoryUnit
            },
            limits: {
              cpu: item.resources.limits.cpu + (item.resources.limits.cpuUnit === 'core' ? '' : item.resources.limits.cpuUnit),
              memory: item.resources.limits.memory + item.resources.limits.memoryUnit
            }
          }
          if (item.resources.requests.cpu === '') {
            delete resources.requests['cpu']
          }
          if (item.resources.limits.cpu === '') {
            delete resources.limits['cpu']
          }
          if (item.resources.requests.memory === '') {
            delete resources.requests['memory']
          }
          if (item.resources.limits.memory === '') {
            delete resources.limits['memory']
          }
        }
        // command & args
        let command = []
        let args = []
        if (item.commandDisplay === 1) {
          item.command.forEach((c, index) => {
            command.push(c.key)
          })
          item.args.forEach((a, index) => {
            args.push(a.key)
          })
        }
        // env
        let env = []
        if (item.envDisplay === 1) {
          if (item.env.length > 0) {
            item.env.forEach((e, index) => {
              env.push({
                'name': e.name,
                'value': e.value
              })
            })
          }
          if (item.envFromSecret.length > 0) {
            item.envFromSecret.forEach((e, index) => {
              env.push({
                'name': e.name,
                'valueFrom': {
                  'secretKeyRef': {
                    'name': e.valueFrom.name,
                    'key': e.valueFrom.key
                  }
                }
              })
            })
          }
          if (item.envFromConfigMap.length > 0) {
            item.envFromConfigMap.forEach((e, index) => {
              env.push({
                'name': e.name,
                'valueFrom': {
                  'configMapKeyRef': {
                    'name': e.valueFrom.name,
                    'key': e.valueFrom.key
                  }
                }
              })
            })
          }
          if (item.envFromField.length > 0) {
            item.envFromField.forEach((e, index) => {
              env.push({
                'name': e.name,
                'valueFrom': {
                  'fieldRef': {
                    'apiVersion': e.valueFrom.name,
                    'fieldPath': e.valueFrom.key
                  }
                }
              })
            })
          }
        }
        // livenessProbe
        let livenessProbe = {}
        if (item.livenessProbeDisplay === 1) {
          if (item.livenessProbeType === 'httpGet') {
            livenessProbe = {
              'httpGet': {
                'path': item.livenessProbeHTTPGet.httpGet.path,
                'port': parseInt(item.livenessProbeHTTPGet.httpGet.port) ? parseInt(item.livenessProbeHTTPGet.httpGet.port) : item.livenessProbeHTTPGet.httpGet.port,
                'scheme': item.livenessProbeHTTPGet.httpGet.scheme
              },
              initialDelaySeconds: parseInt(item.livenessProbeHTTPGet.initialDelaySeconds),
              timeoutSeconds: parseInt(item.livenessProbeHTTPGet.timeoutSeconds),
              periodSeconds: parseInt(item.livenessProbeHTTPGet.periodSeconds),
              successThreshold: parseInt(item.livenessProbeHTTPGet.successThreshold),
              failureThreshold: parseInt(item.livenessProbeHTTPGet.failureThreshold)
            }
          }
          if (item.livenessProbeType === 'socket') {
            livenessProbe = {
              'tcpSocket': {
                'port': parseInt(item.livenessProbeTcpSocket.tcpSocket.port) ? parseInt(item.livenessProbeTcpSocket.tcpSocket.port) : item.livenessProbeTcpSocket.tcpSocket.port
              },
              initialDelaySeconds: parseInt(item.livenessProbeTcpSocket.initialDelaySeconds),
              timeoutSeconds: parseInt(item.livenessProbeTcpSocket.timeoutSeconds),
              periodSeconds: parseInt(item.livenessProbeTcpSocket.periodSeconds),
              successThreshold: parseInt(item.livenessProbeTcpSocket.successThreshold),
              failureThreshold: parseInt(item.livenessProbeTcpSocket.failureThreshold)
            }
          }
          if (item.livenessProbeType === 'command') {
            let command = []
            item.livenessProbeCommand.exec.command.forEach((c, index) => {
              command.push(c.key)
            })
            livenessProbe = {
              'exec': {
                'command': command
              },
              initialDelaySeconds: parseInt(item.livenessProbeCommand.initialDelaySeconds),
              timeoutSeconds: parseInt(item.livenessProbeCommand.timeoutSeconds),
              periodSeconds: parseInt(item.livenessProbeCommand.periodSeconds),
              successThreshold: parseInt(item.livenessProbeCommand.successThreshold),
              failureThreshold: parseInt(item.livenessProbeCommand.failureThreshold)
            }
          }
        }
        // readinessProbe
        let readinessProbe = {}
        if (item.readinessProbeDisplay === 1) {
          if (item.readinessProbeType === 'httpGet') {
            readinessProbe = {
              'httpGet': {
                'path': item.readinessProbeHTTPGet.httpGet.path,
                'port': parseInt(item.readinessProbeHTTPGet.httpGet.port) ? parseInt(item.readinessProbeHTTPGet.httpGet.port) : item.readinessProbeHTTPGet.httpGet.port,
                'scheme': item.readinessProbeHTTPGet.httpGet.scheme
              },
              initialDelaySeconds: parseInt(item.readinessProbeHTTPGet.initialDelaySeconds),
              timeoutSeconds: parseInt(item.readinessProbeHTTPGet.timeoutSeconds),
              periodSeconds: parseInt(item.readinessProbeHTTPGet.periodSeconds),
              successThreshold: parseInt(item.readinessProbeHTTPGet.successThreshold),
              failureThreshold: parseInt(item.readinessProbeHTTPGet.failureThreshold)
            }
          }
          if (item.readinessProbeType === 'socket') {
            readinessProbe = {
              'tcpSocket': {
                'port': parseInt(item.readinessProbeTcpSocket.tcpSocket.port) ? parseInt(item.readinessProbeTcpSocket.tcpSocket.port) : item.readinessProbeTcpSocket.tcpSocket.port
              },
              initialDelaySeconds: parseInt(item.readinessProbeTcpSocket.initialDelaySeconds),
              timeoutSeconds: parseInt(item.readinessProbeTcpSocket.timeoutSeconds),
              periodSeconds: parseInt(item.readinessProbeTcpSocket.periodSeconds),
              successThreshold: parseInt(item.readinessProbeTcpSocket.successThreshold),
              failureThreshold: parseInt(item.readinessProbeTcpSocket.failureThreshold)
            }
          }
          if (item.readinessProbeType === 'command') {
            let command = []
            item.readinessProbeCommand.exec.command.forEach((c, index) => {
              command.push(c.key)
            })
            readinessProbe = {
              'exec': {
                'command': command
              },
              initialDelaySeconds: parseInt(item.readinessProbeCommand.initialDelaySeconds),
              timeoutSeconds: parseInt(item.readinessProbeCommand.timeoutSeconds),
              periodSeconds: parseInt(item.readinessProbeCommand.periodSeconds),
              successThreshold: parseInt(item.readinessProbeCommand.successThreshold),
              failureThreshold: parseInt(item.readinessProbeCommand.failureThreshold)
            }
          }
        }
        // 特权模式
        let securityContext = {}
        if (item.privileged === 1) {
          securityContext['privileged'] = true
        }
        if (item.containersType === 'containers') {
          let containers = {
            'name': item.name,
            'image': item.image,
            'imagePullPolicy': item.imagePullPolicy,
            'ports': ports,
            'volumeMounts': volumeMounts,
            'resources': resources,
            'command': command,
            'args': args,
            'env': env,
            'livenessProbe': livenessProbe,
            'readinessProbe': readinessProbe,
            'securityContext': securityContext
          }
          if (containers.env.length === 0) {
            delete containers['env']
          }
          if (JSON.stringify(containers.livenessProbe) === '{}') {
            delete containers['livenessProbe']
          }
          if (JSON.stringify(containers.readinessProbe) === '{}') {
            delete containers['readinessProbe']
          }
          if (JSON.stringify(containers.securityContext) === '{}') {
            delete containers['securityContext']
          }
          json.spec.template.spec.containers.push(containers)
        }
        if (item.containersType === 'initContainers') {
          let initContainers = {
            'name': item.name,
            'image': item.image,
            'imagePullPolicy': item.imagePullPolicy,
            'ports': ports,
            'volumeMounts': volumeMounts,
            'resources': resources,
            'command': command,
            'args': args,
            'env': env,
            'livenessProbe': livenessProbe,
            'readinessProbe': readinessProbe,
            'securityContext': securityContext
          }
          if (initContainers.env.length === 0) {
            delete initContainers['env']
          }
          if (JSON.stringify(initContainers.livenessProbe) === '{}') {
            delete initContainers['livenessProbe']
          }
          if (JSON.stringify(initContainers.readinessProbe) === '{}') {
            delete initContainers['readinessProbe']
          }
          if (JSON.stringify(initContainers.securityContext) === '{}') {
            delete initContainers['securityContext']
          }
          json.spec.template.spec.initContainers.push(initContainers)
        }
      })
      if (this.formItemAnnotations.items.length > 0) {
        this.formItemAnnotations.items.forEach((item, index) => {
          if (item.key) {
            json.metadata.annotations[item.key] = item.val
          }
        })
      }
      if (this.formItemAnnotations.labels.length > 0) {
        this.formItemAnnotations.labels.forEach((item, index) => {
          if (item.key) {
            json.metadata.labels[item.key] = item.val
          }
        })
      }
      if (value === 'CREATE') {
        formCreateController({
          productId: 100,
          yaml: JSON.stringify(json),
          setName: this.setName
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.$Message.success({
              content: this.$t('create_success')
            })
            this.formAddModel = false
          }
          this.formatTableData()
        })
      } else if (value === 'EDIT') {
        updateController({
          productId: 100,
          updateJson: JSON.stringify(json),
          setName: this.setName,
          postType: 'form'
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.$Message.success({
              content: this.$t('edit_success')
            })
            this.formAddModel = false
          }
          this.formatTableData()
        })
      }
    },
    handleReset () {
      this.formItemBase = {
        template: '不使用模板',
        name: '',
        replicasNum: 1,
        type: 'RollingUpdate',
        rollingUpdate: {
          maxUnavailable: '25%',
          maxSurge: '25%'
        },
        istioDisplay: 0,
        isitoDisabled: true,
        nodeDisplay: 0,
        nodeSelectType: 'nodeLabels',
        nodeAssign: '',
        node: '',
        nodeSelector: [],
        labels: [
          {
            val: '',
            key: ''
          }
        ],
        annotations: [
          {
            val: '',
            key: ''
          }
        ]
      }
      this.formItemVolume = {
        type: 'hostPathVolume',
        volumeDisplay: 0,
        secret: [],
        configMap: [],
        hostPath: [],
        emptyDir: [],
        cephFS: []
      }
      this.formItemConfig = {
        containers: [{
          containersType: 'containers',
          name: '',
          image: '',
          imagePullPolicy: 'IfNotPresent',
          portsDisplay: 0,
          ports: [{
            name: '',
            containerPort: '',
            protocol: 'TCP'
          }],
          volumeMountDisplay: 0,
          volumeMounts: [{
            name: '',
            readOnly: '',
            mountPath: ''
          }],
          resourcesDisplay: 0,
          privileged: 0,
          resources: {
            requests: {
              cpu: '',
              memory: '',
              cpuUnit: 'core',
              memoryUnit: 'Mi'
            },
            limits: {
              cpu: '',
              memory: '',
              cpuUnit: 'core',
              memoryUnit: 'Mi'
            }
          },
          commandDisplay: 0,
          command: [],
          args: [],
          envDisplay: 0,
          env: [],
          envFromSecret: [],
          envFromConfigMap: [],
          envFromField: [],
          healthCheckDisplay: 0,
          livenessProbeDisplay: 0,
          readinessProbeDisplay: 0,
          livenessProbeType: 'httpGet',
          livenessProbeCommand: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            exec: {
              command: [{
                'key': ''
              }]
            }
          },
          livenessProbeHTTPGet: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            httpGet: {
              'path': '',
              'port': '',
              'scheme': 'HTTP'
            }
          },
          livenessProbeTcpSocket: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            tcpSocket: {
              'port': ''
            }
          },
          readinessProbeType: 'httpGet',
          readinessProbeCommand: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            exec: {
              command: [{
                'key': ''
              }]
            }
          },
          readinessProbeHTTPGet: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            httpGet: {
              'path': '',
              'port': '',
              'scheme': 'HTTP'
            }
          },
          readinessProbeTcpSocket: {
            initialDelaySeconds: 1,
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3,
            tcpSocket: {
              'port': ''
            }
          },
          serviceAccount: ''
        }]
      }
      this.formItemAnnotations = {
        items: [
          {
            val: '',
            key: ''
          }
        ],
        labels: [
          {
            val: '',
            key: ''
          }
        ]
      }
    },
    formEdit () {
      this.nameDisabled = this.option === 'edit'
      this.getTemplate()
      this.namespaceLabel('istio')
      this.getConfigMap()
      this.getSecret()
      getOneControllerInfo({
        productId: 100,
        setName: this.setName,
        ctrl: this.ctrl
      }).then(res => {
        this.editFun(res)
      })
    },
    formEditTemplate (spec) {
      this.nameDisabled = this.option === 'edit'
      this.namespaceLabel('istio')
      this.getConfigMap()
      this.getSecret()
      let res = {
        'data': spec
      }
      this.editFun(res)
    },
    editFun (res) {
      this.deployment = res.data
      this.formItemBase.name = this.option !== 'copy' ? res.data.metadata.name : res.data.metadata.name + '-copy'
      this.formItemBase.replicasNum = res.data.spec.replicas
      if (res.data.kind === 'Deployment') {
        this.formItemBase.type = res.data.spec.strategy.type
        if (this.formItemBase.type === 'RollingUpdate') {
          this.formItemBase.rollingUpdate.maxUnavailable = res.data.spec.strategy.rollingUpdate.maxUnavailable
          this.formItemBase.rollingUpdate.maxSurge = res.data.spec.strategy.rollingUpdate.maxSurge
        }
      } else if (res.data.kind === 'StatefulSet') {
        this.formItemBase.type = res.data.spec.updateStrategy.type
        if (this.formItemBase.type === 'RollingUpdate') {
          this.formItemBase.rollingUpdate = {
            'partition': res.data.spec.updateStrategy.rollingUpdate.partition
          }
        }
      }
      this.formItemBase.nodeDisplay = 0
      this.formItemBase.nodeSelector = []
      if (res.data.spec.template.spec.nodeSelector) {
        this.formItemBase.nodeDisplay = 1
        for (let key in res.data.spec.template.spec.nodeSelector) {
          // this.formItemBase.nodeSelector.push({
          //   key: key,
          //   val: res.data.spec.template.spec.nodeSelector[key]
          // })
          this.formItemBase.nodeSelector.push(key + ':' + res.data.spec.template.spec.nodeSelector[key])
        }
      }
      if (res.data.spec.template.spec.nodeName) {
        this.formItemBase.nodeDisplay = 1
        this.formItemBase.nodeSelectType = 'nodeAssign'
        this.formItemBase.nodeAssign = res.data.spec.template.spec.nodeName
      }
      this.formItemBase.labels = []
      // labels 存在进行填充
      if (res.data.spec.template.metadata.labels && this.option !== 'copy') {
        for (const k in res.data.spec.template.metadata.labels) {
          this.formItemBase.labels.push(
            {
              'key': k,
              'val': res.data.spec.template.metadata.labels[k]
            }
          )
        }
      } else { // labels不存在填充空表格
        this.formItemBase.labels.push(
          {
            'key': '',
            'val': ''
          }
        )
      }
      //  annotations 存在进行填充
      this.formItemBase.annotations = []
      if (res.data.spec.template.metadata.annotations && this.option !== 'copy') {
        for (const k in res.data.spec.template.metadata.annotations) {
          // this.formItemBase.annotations.push(
          //   {
          //     'key': k,
          //     'val': res.data.spec.template.metadata.annotations[k]
          //   }
          // )
          if (k === 'sidecar.istio.io/inject' && res.data.spec.template.metadata.annotations[k] === 'false') {
            this.formItemBase.istioDisplay = 0
          } else {
            this.formItemBase.annotations.push(
              {
                'key': k,
                'val': res.data.spec.template.metadata.annotations[k]
              }
            )
          }
        }
        if (this.formItemBase.annotations.length === 0) {
          this.formItemBase.annotations.push(
            {
              'key': '',
              'val': ''
            }
          )
        }
      } else { // annotations不存在填充空表格
        this.formItemBase.annotations.push(
          {
            'key': '',
            'val': ''
          }
        )
      }
      // volumes
      this.formItemVolume.volumeDisplay = 0
      this.formItemVolume.configMap = []
      this.formItemVolume.secret = []
      this.formItemVolume.hostPath = []
      this.formItemVolume.cephFS = []
      this.formItemVolume.emptyDir = []
      if (res.data.spec.template.spec.volumes) {
        this.formItemVolume.volumeDisplay = 1
        res.data.spec.template.spec.volumes.forEach((item, index) => {
          if (item.configMap) {
            this.formItemVolume.configMap.push({
              name: item.name,
              configMapName: item.configMap.name,
              defaultMode: parseInt(item.configMap.defaultMode.toString(8))
            })
          }
          if (item.secret) {
            this.formItemVolume.secret.push({
              name: item.name,
              secretName: item.secret.secretName,
              defaultMode: parseInt(item.secret.defaultMode.toString(8))
            })
          }
          if (item.hostPath) {
            this.formItemVolume.hostPath.push({
              name: item.name,
              path: item.hostPath.path,
              type: item.hostPath.type === '' ? 'none' : item.hostPath.type
            })
          }
          if (item.cephfs) {
            item.cephfs.monitors.join(',')
            this.formItemVolume.cephFS.push({
              name: item.name,
              path: item.cephfs.path,
              user: item.cephfs.user,
              monitors: item.cephfs.monitors.join(';'),
              secretRef: {
                name: item.cephfs.secretRef.name
              }
            })
          }
          if (item.emptyDir) {
            this.formItemVolume.emptyDir.push({
              name: item.name,
              emptyDir: {
                medium: item.emptyDir.medium ? item.emptyDir.medium : 'Empty'
              }
            })
          }
        })
      }
      // Pod
      this.formItemConfig.containers = []
      // containers
      if (res.data.spec.template.spec.containers) {
        this.podSpec(res.data.spec.template.spec.containers, 'containers')
      }
      // initContainers
      if (res.data.spec.template.spec.initContainers) {
        this.podSpec(res.data.spec.template.spec.initContainers, 'initContainers')
      }
      this.formItemAnnotations.items = []
      if (res.data.metadata.annotations && this.option !== 'copy') {
        for (const k in res.data.metadata.annotations) {
          this.formItemAnnotations.items.push(
            {
              'key': k,
              'val': res.data.metadata.annotations[k]
            }
          )
        }
      } else {
        this.formItemAnnotations.items.push(
          {
            'key': '',
            'val': ''
          }
        )
      }
      this.formItemAnnotations.labels = []
      if (res.data.metadata.labels && this.option !== 'copy') {
        for (const k in res.data.metadata.labels) {
          this.formItemAnnotations.labels.push(
            {
              'key': k,
              'val': res.data.metadata.labels[k]
            }
          )
        }
      } else {
        this.formItemAnnotations.labels.push(
          {
            'key': '',
            'val': ''
          }
        )
      }
    },
    podSpec (containers, containersType) {
      containers.forEach((item, index) => {
        let ports = [{
          name: '',
          containerPort: '',
          protocol: 'TCP'
        }]
        if (item.ports) {
          ports = []
          item.ports.forEach((item, index) => {
            ports.push({
              name: item.name,
              containerPort: item.containerPort,
              protocol: item.protocol
            })
          })
        }
        let volumeMounts = [{
          name: '',
          readOnly: '',
          mountPath: ''
        }]
        if (item.volumeMounts) {
          volumeMounts = []
          item.volumeMounts.forEach((item, index) => {
            let readOnly = 'true'
            if (item.readOnly) {
              readOnly = item.readOnly.toString()
            } else {
              readOnly = 'false'
            }
            volumeMounts.push({
              name: item.name,
              readOnly: readOnly,
              mountPath: item.mountPath
            })
          })
        }
        // 资源限制
        let resources = {
          requests: {
            cpu: '',
            memory: '',
            cpuUnit: 'core',
            memoryUnit: 'Mi'
          },
          limits: {
            cpu: '',
            memory: '',
            cpuUnit: 'core',
            memoryUnit: 'Mi'
          }
        }
        let resourcesDisplay = 0
        if (item.resources && JSON.stringify(item.resources) !== '{}') {
          resourcesDisplay = 1
          let unit = ['Ki', 'Mi', 'Gi', 'Ti']
          let requestsMemory = ''
          let requestsMemoryUnit = 'Mi'
          let limitsMemory = ''
          let limitsMemoryUnit = 'Mi'
          unit.forEach((u, index) => {
            if (item.resources.requests && item.resources.requests.memory && item.resources.requests.memory.search(u) !== -1) {
              requestsMemory = item.resources.requests.memory.split(u)[0]
              requestsMemoryUnit = u
            }
            if (item.resources.limits && item.resources.limits.memory && item.resources.limits.memory.search(u) !== -1) {
              limitsMemory = item.resources.limits.memory.split(u)[0]
              limitsMemoryUnit = u
            }
          })
          let requestsCPU = ''
          let limitsCPU = ''
          let requestsCPUUnit = 'core'
          let limitsCPUUnit = 'core'
          if (item.resources.requests && item.resources.requests.cpu) {
            requestsCPU = item.resources.requests.cpu.split('m')[0]
            requestsCPUUnit = item.resources.requests.cpu.includes('m') ? 'm' : 'core'
          }
          if (item.resources.limits && item.resources.limits.cpu) {
            limitsCPU = item.resources.limits.cpu.split('m')[0]
            limitsCPUUnit = item.resources.limits.cpu.includes('m') ? 'm' : 'core'
          }
          resources = {
            requests: {
              cpu: requestsCPU,
              memory: requestsMemory,
              cpuUnit: requestsCPUUnit,
              memoryUnit: requestsMemoryUnit
            },
            limits: {
              cpu: limitsCPU,
              memory: limitsMemory,
              cpuUnit: limitsCPUUnit,
              memoryUnit: limitsMemoryUnit
            }
          }
        }
        // command
        let commandDisplay = 0
        let command = []
        if (item.command) {
          commandDisplay = 1
          item.command.forEach((item, index) => {
            command.push({
              key: item
            })
          })
        }
        // args
        let args = []
        if (item.args) {
          commandDisplay = 1
          item.args.forEach((item, index) => {
            args.push({
              key: item
            })
          })
        }
        // env
        let envDisplay = 0
        let envFromField = []
        let envFromConfigMap = []
        let envFromSecret = []
        let env = []
        if (item.env) {
          envDisplay = 1
          item.env.forEach((e, index) => {
            try {
              if (e.valueFrom.fieldRef) {
                envFromField.push({
                  name: e.name,
                  valueFrom: {
                    name: e.valueFrom.fieldRef.apiVersion,
                    key: e.valueFrom.fieldRef.fieldPath
                  }
                })
              }
              if (e.valueFrom.configMapKeyRef) {
                this.getKeyByConfigMap(e.valueFrom.configMapKeyRef.name)
                envFromConfigMap.push({
                  name: e.name,
                  valueFrom: {
                    name: e.valueFrom.configMapKeyRef.name,
                    key: e.valueFrom.configMapKeyRef.key
                  }
                })
              }
              if (e.valueFrom.secretKeyRef) {
                this.getKeyBySecret(e.valueFrom.secretKeyRef.name)
                envFromSecret.push({
                  name: e.name,
                  valueFrom: {
                    name: e.valueFrom.secretKeyRef.name,
                    key: e.valueFrom.secretKeyRef.key
                  }
                })
              }
            } catch (s) {
              env.push({
                name: e.name,
                value: e.value
              })
            }
          })
        }
        // healthCheck
        let healthCheckDisplay = 0
        let livenessProbeType = 'httpGet'
        let livenessProbeDisplay = 0
        let livenessProbeTcpSocket = {
          initialDelaySeconds: 1,
          timeoutSeconds: 1,
          periodSeconds: 10,
          successThreshold: 1,
          failureThreshold: 3,
          tcpSocket: {
            'port': ''
          }
        }
        let livenessProbeHTTPGet = {
          initialDelaySeconds: 1,
          timeoutSeconds: 1,
          periodSeconds: 10,
          successThreshold: 1,
          failureThreshold: 3,
          httpGet: {
            'path': '',
            'port': '',
            'scheme': 'HTTP'
          }
        }
        let livenessProbeCommand = {
          initialDelaySeconds: 1,
          timeoutSeconds: 1,
          periodSeconds: 10,
          successThreshold: 1,
          failureThreshold: 3,
          exec: {
            command: [{
              'key': ''
            }]
          }
        }
        if (item.livenessProbe) {
          healthCheckDisplay = 1
          livenessProbeDisplay = 1
          if (item.livenessProbe.tcpSocket) {
            livenessProbeType = 'socket'
            livenessProbeTcpSocket = {
              tcpSocket: {
                port: item.livenessProbe.tcpSocket.port
              },
              initialDelaySeconds: item.livenessProbe.initialDelaySeconds,
              timeoutSeconds: item.livenessProbe.timeoutSeconds,
              periodSeconds: item.livenessProbe.periodSeconds,
              successThreshold: item.livenessProbe.successThreshold,
              failureThreshold: item.livenessProbe.failureThreshold
            }
          }
          if (item.livenessProbe.httpGet) {
            livenessProbeType = 'httpGet'
            livenessProbeHTTPGet = {
              httpGet: {
                path: item.livenessProbe.httpGet.path,
                port: item.livenessProbe.httpGet.port,
                scheme: item.livenessProbe.httpGet.scheme
              },
              initialDelaySeconds: item.livenessProbe.initialDelaySeconds,
              timeoutSeconds: item.livenessProbe.timeoutSeconds,
              periodSeconds: item.livenessProbe.periodSeconds,
              successThreshold: item.livenessProbe.successThreshold,
              failureThreshold: item.livenessProbe.failureThreshold
            }
          }
          if (item.livenessProbe.exec) {
            livenessProbeType = 'command'
            let command = []
            item.livenessProbe.exec.command.forEach((item, index) => {
              command.push({
                'key': item
              })
            })
            livenessProbeCommand = {
              exec: {
                command: command
              },
              initialDelaySeconds: item.livenessProbe.initialDelaySeconds,
              timeoutSeconds: item.livenessProbe.timeoutSeconds,
              periodSeconds: item.livenessProbe.periodSeconds,
              successThreshold: item.livenessProbe.successThreshold,
              failureThreshold: item.livenessProbe.failureThreshold
            }
          }
        }
        // readinessProbe
        let readinessProbeType = 'httpGet'
        let readinessProbeDisplay = 0
        let readinessProbeTcpSocket = {
          initialDelaySeconds: 1,
          timeoutSeconds: 1,
          periodSeconds: 10,
          successThreshold: 1,
          failureThreshold: 3,
          tcpSocket: {
            'port': ''
          }
        }
        let readinessProbeHTTPGet = {
          initialDelaySeconds: 1,
          timeoutSeconds: 1,
          periodSeconds: 10,
          successThreshold: 1,
          failureThreshold: 3,
          httpGet: {
            'path': '',
            'port': '',
            'scheme': 'HTTP'
          }
        }
        let readinessProbeCommand = {
          initialDelaySeconds: 1,
          timeoutSeconds: 1,
          periodSeconds: 10,
          successThreshold: 1,
          failureThreshold: 3,
          exec: {
            command: [{
              'key': ''
            }]
          }
        }
        if (item.readinessProbe) {
          healthCheckDisplay = 1
          readinessProbeDisplay = 1
          if (item.readinessProbe.tcpSocket) {
            readinessProbeType = 'socket'
            readinessProbeTcpSocket = {
              tcpSocket: {
                port: item.readinessProbe.tcpSocket.port
              },
              initialDelaySeconds: item.readinessProbe.initialDelaySeconds,
              timeoutSeconds: item.readinessProbe.timeoutSeconds,
              periodSeconds: item.readinessProbe.periodSeconds,
              successThreshold: item.readinessProbe.successThreshold,
              failureThreshold: item.readinessProbe.failureThreshold
            }
          }
          if (item.readinessProbe.httpGet) {
            readinessProbeType = 'httpGet'
            readinessProbeHTTPGet = {
              httpGet: {
                path: item.readinessProbe.httpGet.path,
                port: item.readinessProbe.httpGet.port,
                scheme: item.readinessProbe.httpGet.scheme
              },
              initialDelaySeconds: item.readinessProbe.initialDelaySeconds,
              timeoutSeconds: item.readinessProbe.timeoutSeconds,
              periodSeconds: item.readinessProbe.periodSeconds,
              successThreshold: item.readinessProbe.successThreshold,
              failureThreshold: item.readinessProbe.failureThreshold
            }
          }
          if (item.readinessProbe.exec) {
            readinessProbeType = 'command'
            let command = []
            item.readinessProbe.exec.command.forEach((item, index) => {
              command.push({
                'key': item
              })
            })
            readinessProbeCommand = {
              exec: {
                command: command
              },
              initialDelaySeconds: item.readinessProbe.initialDelaySeconds,
              timeoutSeconds: item.readinessProbe.timeoutSeconds,
              periodSeconds: item.readinessProbe.periodSeconds,
              successThreshold: item.readinessProbe.successThreshold,
              failureThreshold: item.readinessProbe.failureThreshold
            }
          }
        }
        // 特权模式
        let privileged = 0
        if (item.securityContext && item.securityContext.privileged) {
          privileged = 1
        }
        this.formItemConfig.containers.push({
          containersType: containersType,
          name: item.name,
          image: item.image,
          imagePullPolicy: item.imagePullPolicy,
          portsDisplay: item.ports ? 1 : 0,
          ports: ports,
          volumeMountDisplay: item.volumeMounts ? 1 : 0,
          privileged: privileged,
          resourcesDisplay: resourcesDisplay,
          volumeMounts: volumeMounts,
          resources: resources,
          commandDisplay: commandDisplay,
          command: command,
          args: args,
          envDisplay: envDisplay,
          env: env,
          envFromSecret: envFromSecret,
          envFromConfigMap: envFromConfigMap,
          envFromField: envFromField,
          healthCheckDisplay: healthCheckDisplay,
          livenessProbeDisplay: livenessProbeDisplay,
          livenessProbeType: livenessProbeType,
          livenessProbeCommand: livenessProbeCommand,
          livenessProbeHTTPGet: livenessProbeHTTPGet,
          livenessProbeTcpSocket: livenessProbeTcpSocket,
          readinessProbeDisplay: readinessProbeDisplay,
          readinessProbeType: readinessProbeType,
          readinessProbeCommand: readinessProbeCommand,
          readinessProbeHTTPGet: readinessProbeHTTPGet,
          readinessProbeTcpSocket: readinessProbeTcpSocket,
          serviceAccount: ''
        })
      })
    },
    fromTemplate () {
      this.$refs['createFormTemplate'].validate(valid => {
        if (valid) {
          let params = {
            setName: this.setName,
            ctrl: this.ctrl,
            name: this.formItemTemplate.name,
            describe: this.formItemTemplate.describe
          }
          createTemplate(params).then(res => {
            if (res.code === 200) {
              this.$Message.success({
                content: this.$t('action_success')
              })
              this.templateShow = false
            } else {
              this.$Message.error('操作失败')
            }
          })
        }
      })
    }
  }
}
</script>

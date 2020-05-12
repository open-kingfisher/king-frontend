<template>
  <div>
    <information info="目标规则：其所定义的策略，决定了经过路由处理之后的流量的访问策略。这些策略中可以定义负载均衡配置、连接池大小以及外部检测配置。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
        <ButtonGroup>
          <Button v-if="hasPerm('add_dr')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button v-if="hasPerm('a_add_dr')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px" type="success" ghost>{{ this.$t('advanced_Add') }}</Button>
          <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Drawer
      :draggable=true
      :closable=false
      v-model="editShow"
      :scrollable=true
      width="50">
      <div slot="header">
        <span>{{optionTitle}} {{resourceName}}</span>
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
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{resourceName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal v-model="formAddModel" :title="optionTitle" width="900">
      <div style="width: 800px;margin-bottom: 15px;margin-left: 30px">
        <Steps :current="current">
          <Step title="基本信息"></Step>
          <Step title="全局流量策略"></Step>
          <Step title="版本控制"></Step>
          <Step title="注解"></Step>
        </Steps>
      </div>
      <hr style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
      <Form ref="createFormItem" v-show="current === 0" :model="formItem" :label-width="55" :rules="ruleValidate">
        <FormItem :label="this.$t('name')" prop="name" class="ivu-form-item ivu-form-item-required">
          <Input v-model="formItem.name" :disabled="nameDisabled"></Input>
        </FormItem>
        <div v-for="(item, index) in formItem.labels" :key="index" :value="item">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
          <FormItem label="标签">
            <Row type="flex" justify="space-between">
              <Col span="22">
                <Input v-model="item.key" placeholder="请输入键">
                </Input>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('formItem',index)" icon="md-trash">
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
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('formItem')" icon="md-add"></Button>
          </Row>
        </FormItem>
      </Form>
      <Form ref="createFormTrafficPolicy" v-show="current === 1" :model="formItemTrafficPolicy" :label-width="60">
        <!-- 负载均衡 -->
        <FormItem label="负载均衡">
          <Col span="24">
            <i-switch size="large" v-model="formItemTrafficPolicy.trafficPolicy.loadBalancerDisplay" :true-value=1 :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </Col>
        </FormItem>
        <FormItem  v-if="formItemTrafficPolicy.trafficPolicy.loadBalancerDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="12">
              <FormItem>
                <RadioGroup  v-model="formItemTrafficPolicy.trafficPolicy.loadBalancerType" type="button">
                    <Radio label="simple">通用</Radio>
                    <Radio label="consistentHash">一致性哈希</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!-- simple -->
        <FormItem v-if="formItemTrafficPolicy.trafficPolicy.loadBalancerType === 'simple' && formItemTrafficPolicy.trafficPolicy.loadBalancerDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="2">
              <FormItem label="负载方式" :label-width="60"></FormItem>
            </Col>
            <Col span="22">
              <FormItem>
                <Select v-model="formItemTrafficPolicy.trafficPolicy.loadBalancer.simple">
                  <Option value="ROUND_ROBIN">轮询</Option>
                  <Option value="LEAST_CONN">最少连接</Option>
                  <Option value="RANDOM">随机</Option>
                  <Option value="PASSTHROUGH">穿透</Option>
                 </Select>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!-- consistentHash -->
        <FormItem v-if="formItemTrafficPolicy.trafficPolicy.loadBalancerType === 'consistentHash' && formItemTrafficPolicy.trafficPolicy.loadBalancerDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="7">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.loadBalancer.consistentHash.httpCookie.name">
                   <span slot="prepend">Cookie名</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="11">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.loadBalancer.consistentHash.httpCookie.path">
                  <span slot="prepend">Cookie路径</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="5">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.loadBalancer.consistentHash.httpCookie.ttl">
                  <span slot="prepend">Cookie有效期</span>
                   <span slot="append">s</span>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!-- 连接池 -->
        <FormItem label="连接池">
          <Col span="24">
            <i-switch size="large" v-model="formItemTrafficPolicy.trafficPolicy.connectionPoolDisplay" :true-value=1 :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </Col>
        </FormItem>
        <!-- TCP -->
        <FormItem  label="TCP" v-if="formItemTrafficPolicy.trafficPolicy.connectionPoolDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="11">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.tcp.maxConnections">
                   <span slot="prepend">最大连接数</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.tcp.connectTimeout">
                  <span slot="prepend">超时时间</span>
                  <span slot="append">s</span>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem v-if="formItemTrafficPolicy.trafficPolicy.connectionPoolDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="8">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.tcp.tcpKeepalive.probes">
                  <span slot="prepend">会话保持探测最大数</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.tcp.tcpKeepalive.time">
                  <span slot="prepend">会话保持时间</span>
                  <span slot="append">s</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="7">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.tcp.tcpKeepalive.interval">
                  <span slot="prepend">会话保持周期</span>
                  <span slot="append">s</span>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!-- HTTP -->
        <FormItem label="HTTP" v-if="formItemTrafficPolicy.trafficPolicy.connectionPoolDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="8">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.http.http1MaxPendingRequests">
                   <span slot="prepend">挂起的HTTP请求最大数</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="7">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.http.http2MaxRequests">
                  <span slot="prepend">最大请求数</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.http.maxRequestsPerConnection">
                  <span slot="prepend">每个连接的最大请求数</span>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem v-if="formItemTrafficPolicy.trafficPolicy.connectionPoolDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="7">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.http.maxRetries">
                  <span slot="prepend">最大重试次数</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="7">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.http.idleTimeout">
                  <span slot="prepend">空闲超时</span>
                  <span slot="append">s</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="3">
              <FormItem label="HTTP协议升级" :label-width="100"></FormItem>
            </Col>
            <Col span="6">
              <FormItem>
                <Select v-model="formItemTrafficPolicy.trafficPolicy.connectionPool.http.h2UpgradePolicy">
                  <Option value="DEFAULT">默认</Option>
                  <Option value="DO_NOT_UPGRADE">不升级</Option>
                  <Option value="UPGRADE">升级</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!-- 断路器 -->
        <FormItem label="断路器">
          <Col span="24">
            <i-switch size="large" v-model="formItemTrafficPolicy.trafficPolicy.outlierDetectionDisplay" :true-value=1 :false-value=0>
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </Col>
        </FormItem>
        <FormItem v-if="formItemTrafficPolicy.trafficPolicy.outlierDetectionDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="8">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.outlierDetection.consecutiveErrors">
                   <span slot="prepend">错误数</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.outlierDetection.interval">
                  <span slot="prepend">时间间隔</span>
                  <span slot="append">s</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="7">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.outlierDetection.baseEjectionTime">
                  <span slot="prepend">断路时间</span>
                  <span slot="append">s</span>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem v-if="formItemTrafficPolicy.trafficPolicy.outlierDetectionDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="11">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.outlierDetection.maxEjectionPercent">
                  <span slot="prepend">最大断路百分比</span>
                  <span slot="append">%</span>
                </Input>
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem>
                <Input v-model="formItemTrafficPolicy.trafficPolicy.outlierDetection.minHealthPercent">
                  <span slot="prepend">最小健康百分比</span>
                  <span slot="append">%</span>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
      </Form>
      <Form ref="createFormConfig" v-show="current === 2" :model="formItemConfig" :label-width="60">
        <!-- 服务名 -->
        <FormItem label="服务名" class="ivu-form-item ivu-form-item-required">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem
                :prop="'host'"
                :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                <Select v-model="formItemConfig.host" placeholder="目标服务">
                  <Option v-for="(v, k ) in service" :value="k" :key="k">{{ k }}</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <div v-for="(item, index) in formItemConfig.subsets" :key="index" :value="item">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
          <!-- 名称 -->
          <FormItem label="版本名">
            <Row type="flex" justify="space-between">
              <Col span="22">
                <FormItem>
<!--                  :prop="'subsets.' + index + '.name'"-->
<!--                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">-->
                  <Input v-model="item.name">
                  </Input>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('formItemConfig',index)"
                        :disabled="formItemConfig.subsets.length === 1" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
          <div v-for="(v, i) in formItemConfig.subsets[index].labels" :key="'label' + i" :value="i">
            <FormItem :label="i === 0 ? '标签' : ''">
              <Row type="flex" justify="space-between">
                <Col span="10">
                  <FormItem>
<!--                    :prop="'subsets.' + index + '.labels.' + i + '.key'"-->
<!--                    :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">-->
                    <Input v-model="v.key">
                      <span slot="prepend">键</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="11">
                  <FormItem>
<!--                    :prop="'subsets.' + index + '.labels.' + i + '.val'"-->
<!--                    :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">-->
                    <Input v-model="v.val">
                      <span slot="prepend">值</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('labels',index, i)"
                          :disabled="formItemConfig.subsets[index].labels.length === 1" icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleAdd('labels', index)" icon="md-add">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!-- 负载均衡 -->
          <FormItem label="负载均衡">
            <Col span="24">
              <i-switch size="large" v-model="item.trafficPolicy.loadBalancerDisplay" :true-value=1 :false-value=0>
                <span slot="open">开启</span>
                <span slot="close">关闭</span>
              </i-switch>
            </Col>
          </FormItem>
          <FormItem  v-if="item.trafficPolicy.loadBalancerDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="12">
                <FormItem>
                  <RadioGroup  v-model="item.trafficPolicy.loadBalancerType" type="button">
                      <Radio label="simple">通用</Radio>
                      <Radio label="consistentHash">一致性哈希</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- simple -->
          <FormItem v-if="item.trafficPolicy.loadBalancerType === 'simple' && item.trafficPolicy.loadBalancerDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="2">
                <FormItem label="负载方式" :label-width="60"></FormItem>
              </Col>
              <Col span="22">
                <FormItem>
                  <Select v-model="item.trafficPolicy.loadBalancer.simple">
                    <Option value="ROUND_ROBIN">轮询</Option>
                    <Option value="LEAST_CONN">最少连接</Option>
                    <Option value="RANDOM">随机</Option>
                    <Option value="PASSTHROUGH">穿透</Option>
                   </Select>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- consistentHash -->
          <FormItem v-if="item.trafficPolicy.loadBalancerType === 'consistentHash' && item.trafficPolicy.loadBalancerDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="7">
                <FormItem>
                  <Input v-model="item.trafficPolicy.loadBalancer.consistentHash.httpCookie.name">
                     <span slot="prepend">Cookie名</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="11">
                <FormItem>
                  <Input v-model="item.trafficPolicy.loadBalancer.consistentHash.httpCookie.path">
                    <span slot="prepend">Cookie路径</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  <Input v-model="item.trafficPolicy.loadBalancer.consistentHash.httpCookie.ttl">
                    <span slot="prepend">Cookie有效期</span>
                     <span slot="append">s</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- 连接池 -->
          <FormItem label="连接池">
            <Col span="24">
              <i-switch size="large" v-model="item.trafficPolicy.connectionPoolDisplay" :true-value=1 :false-value=0>
                <span slot="open">开启</span>
                <span slot="close">关闭</span>
              </i-switch>
            </Col>
          </FormItem>
          <!-- TCP -->
          <FormItem label="TCP" v-if="item.trafficPolicy.connectionPoolDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="11">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.tcp.maxConnections">
                     <span slot="prepend">最大连接数</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.tcp.connectTimeout">
                    <span slot="prepend">超时时间</span>
                    <span slot="append">s</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem v-if="item.trafficPolicy.connectionPoolDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="8">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.tcp.tcpKeepalive.probes">
                    <span slot="prepend">会话保持探测最大数</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.tcp.tcpKeepalive.time">
                    <span slot="prepend">会话保持时间</span>
                    <span slot="append">s</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="7">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.tcp.tcpKeepalive.interval">
                    <span slot="prepend">会话保持周期</span>
                    <span slot="append">s</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- HTTP -->
          <FormItem label="HTTP" v-if="item.trafficPolicy.connectionPoolDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="8">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.http.http1MaxPendingRequests">
                     <span slot="prepend">挂起的HTTP请求最大数</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="7">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.http.http2MaxRequests">
                    <span slot="prepend">最大请求数</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.http.maxRequestsPerConnection">
                    <span slot="prepend">每个连接的最大请求数</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem v-if="item.trafficPolicy.connectionPoolDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="7">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.http.maxRetries">
                    <span slot="prepend">最大重试次数</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="7">
                <FormItem>
                  <Input v-model="item.trafficPolicy.connectionPool.http.idleTimeout">
                    <span slot="prepend">空闲超时</span>
                    <span slot="append">s</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="3">
                <FormItem label="HTTP协议升级" :label-width="100"></FormItem>
              </Col>
              <Col span="6">
                <FormItem>
                  <Select v-model="item.trafficPolicy.connectionPool.http.h2UpgradePolicy">
                    <Option value="DEFAULT">默认</Option>
                    <Option value="DO_NOT_UPGRADE">不升级</Option>
                    <Option value="UPGRADE">升级</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <!-- 断路器 -->
          <FormItem label="断路器">
            <Col span="24">
              <i-switch size="large" v-model="item.trafficPolicy.outlierDetectionDisplay" :true-value=1 :false-value=0>
                <span slot="open">开启</span>
                <span slot="close">关闭</span>
              </i-switch>
            </Col>
          </FormItem>
          <FormItem v-if="item.trafficPolicy.outlierDetectionDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="8">
                <FormItem>
                  <Input v-model="item.trafficPolicy.outlierDetection.consecutiveErrors">
                     <span slot="prepend">错误数</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem>
                  <Input v-model="item.trafficPolicy.outlierDetection.interval">
                    <span slot="prepend">时间间隔</span>
                    <span slot="append">s</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="7">
                <FormItem>
                  <Input v-model="item.trafficPolicy.outlierDetection.baseEjectionTime">
                    <span slot="prepend">断路时间</span>
                    <span slot="append">s</span>
                  </Input>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem v-if="item.trafficPolicy.outlierDetectionDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="11">
                <FormItem>
                  <Input v-model="item.trafficPolicy.outlierDetection.maxEjectionPercent">
                    <span slot="prepend">最大断路百分比</span>
                    <span slot="append">%</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem>
                  <Input v-model="item.trafficPolicy.outlierDetection.minHealthPercent">
                    <span slot="prepend">最小健康百分比</span>
                    <span slot="append">%</span>
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
      <Form ref="createFormAnnotations" v-show="current === 3" :model="formItemAnnotations" :label-width="55">
        <div v-for="(item, index) in formItemAnnotations.items" :key="index" :value="item">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
          <FormItem :label="'注解'">
          <Row type="flex" justify="space-between">
            <Col span="22">
              <Input v-model="item.key" placeholder="请输入键">
              </Input>
            </Col>
            <Col span="1" offset="0" style="margin-right: 0px">
              <Button type="dashed" @click="handleRemove('formItemAnnotations',index)" icon="md-trash">
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
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('formItemAnnotations')" icon="md-add"></Button>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" v-if="current != 0" @click="previous">{{this.$t('previous')}}</Button>
        <Button type="primary" v-if="current != 3" @click="next">{{this.$t('next')}}</Button>
        <Button type="primary" v-if="current == 3 && option == 'add'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
        <Button type="primary" v-if="current == 3 && option == 'edit'" @click="formOption('EDIT')">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  Get,
  List,
  Create,
  Delete,
  Update,
  formCreate
} from '@/api/istio/destinationrules.js'
import { getAllService } from '@/api/discovery'
import { formatDate } from '@/api/tools'
import { forEach } from '@/libs/tools'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../../other-page/information.vue'
import { hasPermission } from '@/router/permission'
const json2yaml = require('json2yaml')
const yaml2json = require('js-yaml')

export default {
  components: {
    SearchTable,
    YamlModal,
    Information
  },
  data () {
    const validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        if (this.nameExistCheck) {
          this.tableData.forEach((item, index) => {
            if (item.name === value) {
              callback(new Error(this.$t('name_exists')))
            }
          })
        }
        callback()
      }
    }
    return {
      // From Add Model
      dr: '',
      deployment: [],
      nameDisabled: false,
      editData: '',
      formAddModel: false,
      service: [],
      port: [],
      servicePort: {},
      current: 0,
      formItem: {
        name: '',
        labels: [
          {
            val: '',
            key: ''
          }
        ]
      },
      formItemTrafficPolicy: {
        trafficPolicy: {
          loadBalancerDisplay: 0,
          loadBalancerType: 'simple',
          loadBalancer: {
            simple: 'ROUND_ROBIN',
            consistentHash: {
              httpCookie: {
                name: '',
                path: '',
                ttl: ''
              }
            }
          },
          connectionPoolDisplay: 0,
          connectionPool: {
            tcp: {
              maxConnections: '',
              connectTimeout: '',
              tcpKeepalive: {
                time: '',
                interval: '',
                probes: ''
              }
            },
            http: {
              http1MaxPendingRequests: '',
              http2MaxRequests: '',
              maxRequestsPerConnection: '',
              maxRetries: '',
              idleTimeout: '',
              h2UpgradePolicy: ''
            }
          },
          outlierDetectionDisplay: 0,
          outlierDetection: {
            consecutiveErrors: '',
            interval: '',
            baseEjectionTime: '',
            maxEjectionPercent: '',
            minHealthPercent: ''
          }
        }
      },
      formItemConfig: {
        host: '',
        subsets: [
          {
            name: '',
            labels: [{
              key: '',
              val: ''
            }],
            trafficPolicy: {
              loadBalancerDisplay: 0,
              loadBalancerType: 'simple',
              loadBalancer: {
                simple: 'ROUND_ROBIN',
                consistentHash: {
                  httpCookie: {
                    name: '',
                    path: '',
                    ttl: ''
                  }
                }
              },
              connectionPoolDisplay: 0,
              connectionPool: {
                tcp: {
                  maxConnections: '',
                  connectTimeout: '',
                  tcpKeepalive: {
                    time: '',
                    interval: '',
                    probes: ''
                  }
                },
                http: {
                  http1MaxPendingRequests: '',
                  http2MaxRequests: '',
                  maxRequestsPerConnection: '',
                  maxRetries: '',
                  idleTimeout: '',
                  h2UpgradePolicy: ''
                }
              },
              outlierDetectionDisplay: 0,
              outlierDetection: {
                consecutiveErrors: '',
                interval: '',
                baseEjectionTime: '',
                maxEjectionPercent: '',
                minHealthPercent: ''
              }
            }
          }
        ]
      },
      formItemAnnotations: {
        items: [
          {
            val: '',
            key: ''
          }
        ]
      },
      ruleValidate: {
        name: [
          { validator: validateName, trigger: 'blur' }
        ]
      },
      // Advanced Add Model End
      deleteModel: false,
      deleteLoading: false,
      option: '',
      optionTitle: '',
      yamlType: 'success',
      jsonType: 'default',
      JsonFormat: false,
      YamlFormat: true,
      editorLang: 'yaml',
      editorContent: '',
      resourceName: '',
      editShow: false,
      createModalShow: false,
      updateYaml: '',
      originYaml: '',
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
                    name: 'destinationruleinfo',
                    params: {
                      resourceName: params.row.name
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: this.$t('service'),
          key: 'host'
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
          width: 200,
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
                    disabled: !hasPermission('edit_dr')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.$refs['createFormItem'].resetFields()
                      this.$refs['createFormConfig'].resetFields()
                      this.current = 0
                      this.optionTitle = this.$t('edit') + ' ' + params.row.name
                      this.option = 'edit'
                      this.formAddModel = true
                      this.nameExistCheck = false
                      this.resourceName = params.row.name
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
                    disabled: !hasPermission('a_edit_dr')
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
                      this.resourceName = params.row.name
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
                    type: 'error',
                    size: 'small',
                    disabled: !hasPermission('del_dr')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.resourceName = params.row.name
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ],
      tableData: []
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
    this.formatTableData()
  },
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
      Get({
        productId: 100,
        resourceName: this.resourceName
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
        Update({
          productId: 100,
          postType: 'yaml',
          updateJson: updateJson
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.formatTableData()
            this.$Message.success({
              content: this.$t('edit_success')
            })
            this.editShow = false
          } else {
            this.$Message.error({
              content: this.$t('edit_failure')
            })
          }
        })
      } else {
        if (this.updateYaml) {
          Create({
            productId: 100,
            yaml: JSON.stringify(this.updateYaml)
          }).then(res => {
            if (res.code === 200 && res.msg === '') {
              this.formatTableData()
              this.$Message.success({
                content: this.$t('create_success')
              })
              this.editShow = false
            } else {
              this.$Message.error({
                content: this.$t('edit_failure')
              })
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
      this.resourceName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.editShow = true
    },
    del () {
      this.deleteLoading = true
      Delete({
        productId: 100,
        resourceName: this.resourceName
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
    formatTableData () {
      List({
        productId: 100
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.metadata.name,
            host: item.spec.host,
            create_time: formatDate(item.metadata.creationTimestamp)
          })
        })
        this.tableData = data
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    },
    // 表单添加
    createBtnClick () {
      this.$refs['createFormItem'].resetFields()
      this.$refs['createFormConfig'].resetFields()
      this.handleReset()
      this.nameExistCheck = true
      this.current = 0
      this.ingressName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.formAddModel = true
      this.nameDisabled = false
      this.getService()
    },
    next () {
      if (this.current === 0) {
        this.$refs['createFormItem'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      } else if (this.current === 1) {
        this.current += 1
        // this.$refs['createFormTrafficPolicy'].validate(valid => {
        //   if (valid) {
        //     this.current += 1
        //   }
        // })
      } else if (this.current === 2) {
        this.$refs['createFormConfig'].validate(valid => {
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
      if (type === 'formItem') {
        this.formItem.labels.splice(index, 1)
      }
      if (type === 'labels') {
        this.formItemConfig.subsets[index].labels.splice(secondIndex, 1)
      }
      if (type === 'formItemConfig') {
        this.formItemConfig.subsets.splice(index, 1)
      }
      if (type === 'formItemAnnotations') {
        this.formItemAnnotations.items.splice(index, 1)
      }
    },
    handleAdd (type, index) {
      if (type === 'formItem') {
        this.formItem.labels.push({
          labels: [
            {
              val: '',
              key: ''
            }
          ]
        })
      }
      if (type === 'labels') {
        this.formItemConfig.subsets[index].labels.push({
          val: '',
          key: ''
        })
      }
      if (type === 'formItemConfig') {
        this.formItemConfig.subsets.push(
          {
            name: '',
            labels: [{
              key: '',
              val: ''
            }],
            trafficPolicy: {
              loadBalancerDisplay: 0,
              loadBalancerType: 'simple',
              loadBalancer: {
                simple: 'ROUND_ROBIN',
                consistentHash: {
                  httpCookie: {
                    name: '',
                    path: '',
                    ttl: 0
                  }
                }
              },
              connectionPoolDisplay: 0,
              connectionPool: {
                tcp: {
                  maxConnections: '',
                  connectTimeout: '',
                  tcpKeepalive: {
                    time: '',
                    interval: '',
                    probes: ''
                  }
                },
                http: {
                  http1MaxPendingRequests: '',
                  http2MaxRequests: '',
                  maxRequestsPerConnection: '',
                  maxRetries: '',
                  idleTimeout: '',
                  h2UpgradePolicy: ''
                }
              },
              outlierDetectionDisplay: 0,
              outlierDetection: {
                consecutiveErrors: '',
                interval: '',
                baseEjectionTime: '',
                maxEjectionPercent: '',
                minHealthPercent: ''
              }
            }
          }
        )
      }
      if (type === 'formItemAnnotations') {
        this.formItemAnnotations.items.push({
          items: [
            {
              val: '',
              key: ''
            }
          ]
        })
      }
    },
    getService () {
      getAllService({
        productId: 100
      }).then(res => {
        this.service = {}
        forEach(res.data, (item, index) => {
          this.service[item.metadata.name] = item.spec.ports
        })
      })
    },
    editAndCreate (item, type) {
      let loadBalancer = {}
      if (item.trafficPolicy.loadBalancerDisplay === 1) {
        if (item.trafficPolicy.loadBalancerType === 'simple') {
          loadBalancer = {
            simple: item.trafficPolicy.loadBalancer.simple
          }
        }
        if (item.trafficPolicy.loadBalancerType === 'consistentHash') {
          loadBalancer['consistentHash'] = {
            'httpCookie': {}
          }
          if (item.trafficPolicy.loadBalancer.consistentHash.httpCookie.name) {
            loadBalancer['consistentHash']['httpCookie']['name'] = item.trafficPolicy.loadBalancer.consistentHash.httpCookie.name
          }
          if (item.trafficPolicy.loadBalancer.consistentHash.httpCookie.path) {
            loadBalancer['consistentHash']['httpCookie']['path'] = item.trafficPolicy.loadBalancer.consistentHash.httpCookie.path
          }
          if (item.trafficPolicy.loadBalancer.consistentHash.httpCookie.ttl) {
            loadBalancer['consistentHash']['httpCookie']['ttl'] = item.trafficPolicy.loadBalancer.consistentHash.httpCookie.ttl + 's'
          }
        }
      }
      // connectionPool
      let connectionPool = {}
      if (item.trafficPolicy.connectionPoolDisplay === 1) {
        let tcp = {}
        if (item.trafficPolicy.connectionPool.tcp) {
          if (item.trafficPolicy.connectionPool.tcp.maxConnections) {
            tcp['maxConnections'] = item.trafficPolicy.connectionPool.tcp.maxConnections
          }
          if (item.trafficPolicy.connectionPool.tcp.connectTimeout) {
            tcp['connectTimeout'] = item.trafficPolicy.connectionPool.tcp.connectTimeout + 's'
          }
          if (item.trafficPolicy.connectionPool.tcp.tcpKeepalive) {
            tcp['tcpKeepalive'] = {}
            if (item.trafficPolicy.connectionPool.tcp.tcpKeepalive.time) {
              tcp['tcpKeepalive']['time'] = item.trafficPolicy.connectionPool.tcp.tcpKeepalive.time + 's'
            }
            if (item.trafficPolicy.connectionPool.tcp.tcpKeepalive.interval) {
              tcp['tcpKeepalive']['interval'] = item.trafficPolicy.connectionPool.tcp.tcpKeepalive.interval + 's'
            }
            if (item.trafficPolicy.connectionPool.tcp.tcpKeepalive.probes) {
              tcp['tcpKeepalive']['probes'] = item.trafficPolicy.connectionPool.tcp.tcpKeepalive.probes
            }
          }
          connectionPool['tcp'] = tcp
          if (JSON.stringify(connectionPool.tcp.tcpKeepalive) === '{}') {
            delete connectionPool['tcp']['tcpKeepalive']
          }
        }
        let http = {}
        if (item.trafficPolicy.connectionPool.http) {
          if (item.trafficPolicy.connectionPool.http.http1MaxPendingRequests) {
            http['http1MaxPendingRequests'] = item.trafficPolicy.connectionPool.http.http1MaxPendingRequests
          }
          if (item.trafficPolicy.connectionPool.http.http2MaxRequests) {
            http['http2MaxRequests'] = item.trafficPolicy.connectionPool.http.http2MaxRequests
          }
          if (item.trafficPolicy.connectionPool.http.maxRequestsPerConnection) {
            http['maxRequestsPerConnection'] = item.trafficPolicy.connectionPool.http.maxRequestsPerConnection
          }
          if (item.trafficPolicy.connectionPool.http.maxRetries) {
            http['maxRetries'] = item.trafficPolicy.connectionPool.http.maxRetries
          }
          if (item.trafficPolicy.connectionPool.http.idleTimeout) {
            http['idleTimeout'] = item.trafficPolicy.connectionPool.http.idleTimeout + 's'
          }
          if (item.trafficPolicy.connectionPool.http.h2UpgradePolicy) {
            http['h2UpgradePolicy'] = item.trafficPolicy.connectionPool.http.h2UpgradePolicy
          }
          connectionPool['http'] = http
        }
      }
      // outlierDetection
      let outlierDetection = {}
      if (item.trafficPolicy.outlierDetectionDisplay === 1) {
        if (item.trafficPolicy.outlierDetection.consecutiveErrors) {
          outlierDetection['consecutiveErrors'] = item.trafficPolicy.outlierDetection.consecutiveErrors
        }
        if (item.trafficPolicy.outlierDetection.interval) {
          outlierDetection['interval'] = item.trafficPolicy.outlierDetection.interval + 's'
        }
        if (item.trafficPolicy.outlierDetection.baseEjectionTime) {
          outlierDetection['baseEjectionTime'] = item.trafficPolicy.outlierDetection.baseEjectionTime + 's'
        }
        if (item.trafficPolicy.outlierDetection.maxEjectionPercent) {
          outlierDetection['maxEjectionPercent'] = item.trafficPolicy.outlierDetection.maxEjectionPercent
        }
        if (item.trafficPolicy.outlierDetection.minHealthPercent) {
          outlierDetection['minHealthPercent'] = item.trafficPolicy.outlierDetection.minHealthPercent
        }
      }
      if (type === 'global') {
        let trafficPolicy = {
          'loadBalancer': loadBalancer,
          'connectionPool': connectionPool,
          'outlierDetection': outlierDetection
        }
        if (JSON.stringify(loadBalancer) === '{}') {
          delete trafficPolicy['loadBalancer']
        }
        if (JSON.stringify(connectionPool.http) === '{}') {
          delete trafficPolicy['connectionPool']['http']
        }
        if (JSON.stringify(connectionPool.tcp) === '{}') {
          delete trafficPolicy['connectionPool']['tcp']
        }
        if (JSON.stringify(connectionPool) === '{}') {
          delete trafficPolicy['connectionPool']
        }
        if (JSON.stringify(outlierDetection) === '{}') {
          delete trafficPolicy['outlierDetection']
        }
        return trafficPolicy
      } else {
        let labels = {}
        item.labels.forEach((h, i) => {
          if (h.key) {
            labels[h.key] = h.val
          }
        })
        let trafficPolicy = {
          'name': item.name,
          'labels': labels,
          'trafficPolicy': {
            'loadBalancer': loadBalancer,
            'connectionPool': connectionPool,
            'outlierDetection': outlierDetection
          }
        }
        if (!item.name) {
          delete trafficPolicy['name']
        }
        if (JSON.stringify(labels) === '{}') {
          delete trafficPolicy['labels']
        }
        if (JSON.stringify(loadBalancer) === '{}') {
          delete trafficPolicy['trafficPolicy']['loadBalancer']
        }
        if (JSON.stringify(connectionPool.http) === '{}') {
          delete trafficPolicy['trafficPolicy']['connectionPool']['http']
        }
        if (JSON.stringify(connectionPool.tcp) === '{}') {
          delete trafficPolicy['trafficPolicy']['connectionPool']['tcp']
        }
        if (JSON.stringify(connectionPool) === '{}') {
          delete trafficPolicy['trafficPolicy']['connectionPool']
        }
        if (JSON.stringify(outlierDetection) === '{}') {
          delete trafficPolicy['trafficPolicy']['outlierDetection']
        }
        if (JSON.stringify(loadBalancer) === '{}' && JSON.stringify(connectionPool) === '{}' && JSON.stringify(outlierDetection) === '{}') {
          delete trafficPolicy['trafficPolicy']
        }
        return trafficPolicy
      }
    },
    formOption (value) {
      let json = {
        'metadata': {
          'name': this.formItem.name,
          'labels': {},
          'annotations': {}
        },
        'spec': {
          'host': this.formItemConfig.host,
          'subsets': [],
          'trafficPolicy': {}
        }
      }
      if (this.formItem.labels.length > 0) {
        this.formItem.labels.forEach((item, index) => {
          if (item.key) {
            json.metadata.labels[item.key] = item.val
          }
        })
      }
      if (this.formItemConfig.subsets.length > 0) {
        this.formItemConfig.subsets.forEach((item, index) => {
          if (item.name) {
            json.spec.subsets.push(this.editAndCreate(item, ''))
          }
        })
        if (JSON.stringify(json.spec.subsets) === '[]') {
          delete json['spec']['subsets']
        }
      } else {
        delete json['spec']['subsets']
      }
      // global
      let trafficPolicy
      if (this.formItemTrafficPolicy.trafficPolicy) {
        trafficPolicy = this.editAndCreate(this.formItemTrafficPolicy, 'global')
      }
      if (JSON.stringify(trafficPolicy) === '{}') {
        delete json['spec']['trafficPolicy']
      } else {
        json.spec.trafficPolicy = trafficPolicy
      }
      if (this.formItemAnnotations.items.length > 0) {
        this.formItemAnnotations.items.forEach((item, index) => {
          if (item.key) {
            json.metadata.annotations[item.key] = item.val
          }
        })
      }
      if (value === 'CREATE') {
        formCreate({
          productId: 100,
          yaml: JSON.stringify(json)
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.$Message.success({
              content: this.$t('create_success')
            })
            this.formAddModel = false
          } else {
            this.$Message.error({
              content: this.$t('create_failure')
            })
          }
          this.formatTableData()
        })
      } else if (value === 'EDIT') {
        json.metadata.resourceVersion = this.dr.metadata.resourceVersion
        Update({
          productId: 100,
          updateJson: JSON.stringify(json),
          postType: 'form'
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.$Message.success({
              content: this.$t('edit_success')
            })
            this.formAddModel = false
          } else {
            this.$Message.error({
              content: this.$t('edit_failure')
            })
          }
          this.formatTableData()
        })
      }
    },
    handleReset () {
      this.formItem = {
        name: '',
        labels: [
          {
            val: '',
            key: ''
          }
        ]
      }
      this.formItemTrafficPolicy = {
        trafficPolicy: {
          loadBalancerDisplay: 0,
          loadBalancerType: 'simple',
          loadBalancer: {
            simple: 'ROUND_ROBIN',
            consistentHash: {
              httpCookie: {
                name: '',
                path: '',
                ttl: ''
              }
            }
          },
          connectionPoolDisplay: 0,
          connectionPool: {
            tcp: {
              maxConnections: '',
              connectTimeout: '',
              tcpKeepalive: {
                time: '',
                interval: '',
                probes: ''
              }
            },
            http: {
              http1MaxPendingRequests: '',
              http2MaxRequests: '',
              maxRequestsPerConnection: '',
              maxRetries: '',
              idleTimeout: '',
              h2UpgradePolicy: ''
            }
          },
          outlierDetectionDisplay: 0,
          outlierDetection: {
            consecutiveErrors: '',
            interval: '',
            baseEjectionTime: '',
            maxEjectionPercent: '',
            minHealthPercent: ''
          }
        }
      }
      this.formItemConfig = {
        host: '',
        subsets: [
          {
            name: '',
            labels: [{
              key: '',
              val: ''
            }],
            trafficPolicy: {
              loadBalancerDisplay: 0,
              loadBalancerType: 'simple',
              loadBalancer: {
                simple: 'ROUND_ROBIN',
                consistentHash: {
                  httpCookie: {
                    name: '',
                    path: '',
                    ttl: ''
                  }
                }
              },
              connectionPoolDisplay: 0,
              connectionPool: {
                tcp: {
                  maxConnections: '',
                  connectTimeout: '',
                  tcpKeepalive: {
                    time: '',
                    interval: '',
                    probes: ''
                  }
                },
                http: {
                  http1MaxPendingRequests: '',
                  http2MaxRequests: '',
                  maxRequestsPerConnection: '',
                  maxRetries: '',
                  idleTimeout: '',
                  h2UpgradePolicy: ''
                }
              },
              outlierDetectionDisplay: 0,
              outlierDetection: {
                consecutiveErrors: '',
                interval: '',
                baseEjectionTime: '',
                maxEjectionPercent: '',
                minHealthPercent: ''
              }
            }
          }
        ]
      }
    },
    trafficPolicy (item, type) {
      let loadBalancerDisplay = 0
      let loadBalancerType = 'simple'
      let loadBalancer = {
        simple: 'ROUND_ROBIN',
        consistentHash: {
          httpCookie: {
            name: '',
            path: '',
            ttl: ''
          }
        }
      }
      let connectionPoolDisplay = 0
      let connectionPool = {
        tcp: {
          maxConnections: '',
          connectTimeout: '',
          tcpKeepalive: {
            time: '',
            interval: '',
            probes: ''
          }
        },
        http: {
          http1MaxPendingRequests: '',
          http2MaxRequests: '',
          maxRequestsPerConnection: '',
          maxRetries: '',
          idleTimeout: '',
          h2UpgradePolicy: ''
        }
      }
      let outlierDetectionDisplay = 0
      let outlierDetection = {
        consecutiveErrors: '',
        interval: '',
        baseEjectionTime: '',
        maxEjectionPercent: '',
        minHealthPercent: ''
      }
      if (item.trafficPolicy) {
        if (item.trafficPolicy.loadBalancer) {
          loadBalancerDisplay = 1
          if (item.trafficPolicy.loadBalancer.simple) {
            loadBalancerType = 'simple'
            loadBalancer.simple = item.trafficPolicy.loadBalancer.simple
          }
          if (item.trafficPolicy.loadBalancer.consistentHash) {
            loadBalancerType = 'consistentHash'
            loadBalancer.consistentHash.httpCookie.name = item.trafficPolicy.loadBalancer.consistentHash.httpCookie.name
            loadBalancer.consistentHash.httpCookie.path = item.trafficPolicy.loadBalancer.consistentHash.httpCookie.path
            loadBalancer.consistentHash.httpCookie.ttl = item.trafficPolicy.loadBalancer.consistentHash.httpCookie.ttl ? item.trafficPolicy.loadBalancer.consistentHash.httpCookie.ttl.replace(/[a-z]*/ig, '') : ''
          }
        }
        if (item.trafficPolicy.connectionPool) {
          connectionPoolDisplay = 1
          if (item.trafficPolicy.connectionPool.tcp) {
            connectionPool.tcp.maxConnections = item.trafficPolicy.connectionPool.tcp.maxConnections ? item.trafficPolicy.connectionPool.tcp.maxConnections : ''
            connectionPool.tcp.connectTimeout = item.trafficPolicy.connectionPool.tcp.connectTimeout ? item.trafficPolicy.connectionPool.tcp.connectTimeout.replace(/[a-z]*/ig, '') : ''
            if (item.trafficPolicy.connectionPool.tcp.tcpKeepalive) {
              connectionPool.tcp.tcpKeepalive.time = item.trafficPolicy.connectionPool.tcp.tcpKeepalive.time ? item.trafficPolicy.connectionPool.tcp.tcpKeepalive.time.replace(/[a-z]*/ig, '') : ''
              connectionPool.tcp.tcpKeepalive.interval = item.trafficPolicy.connectionPool.tcp.tcpKeepalive.interval ? item.trafficPolicy.connectionPool.tcp.tcpKeepalive.interval.replace(/[a-z]*/ig, '') : ''
            }
          }
          if (item.trafficPolicy.connectionPool.http) {
            connectionPool.http.http1MaxPendingRequests = item.trafficPolicy.connectionPool.http.http1MaxPendingRequests
            connectionPool.http.http2MaxRequests = item.trafficPolicy.connectionPool.http.http2MaxRequests
            connectionPool.http.maxRequestsPerConnection = item.trafficPolicy.connectionPool.http.maxRequestsPerConnection
            connectionPool.http.maxRetries = item.trafficPolicy.connectionPool.http.maxRetries
            connectionPool.http.idleTimeout = item.trafficPolicy.connectionPool.http.idleTimeout ? item.trafficPolicy.connectionPool.http.idleTimeout.replace(/[a-z]*/ig, '') : ''
            connectionPool.http.h2UpgradePolicy = item.trafficPolicy.connectionPool.http.h2UpgradePolicy ? item.trafficPolicy.connectionPool.http.h2UpgradePolicy : ''
          }
        }
        if (item.trafficPolicy.outlierDetection) {
          outlierDetectionDisplay = 1
          outlierDetection.consecutiveErrors = item.trafficPolicy.outlierDetection.consecutiveErrors
          outlierDetection.interval = item.trafficPolicy.outlierDetection.interval ? item.trafficPolicy.outlierDetection.interval.replace(/[a-z]*/ig, '') : ''
          outlierDetection.baseEjectionTime = item.trafficPolicy.outlierDetection.baseEjectionTime ? item.trafficPolicy.outlierDetection.baseEjectionTime.replace(/[a-z]*/ig, '') : ''
          outlierDetection.maxEjectionPercent = item.trafficPolicy.outlierDetection.maxEjectionPercent
          outlierDetection.minHealthPercent = item.trafficPolicy.outlierDetection.minHealthPercent
        }
      }
      if (type === 'global') {
        this.formItemTrafficPolicy = {
          trafficPolicy: {
            loadBalancerDisplay: loadBalancerDisplay,
            loadBalancerType: loadBalancerType,
            loadBalancer: loadBalancer,
            connectionPoolDisplay: connectionPoolDisplay,
            connectionPool: connectionPool,
            outlierDetectionDisplay: outlierDetectionDisplay,
            outlierDetection: outlierDetection
          }
        }
      } else {
        let labels = [{
          'key': '',
          'val': ''
        }]
        if (item.labels) {
          labels = []
          for (const k in item.labels) {
            labels.push(
              {
                'key': k,
                'val': item.labels[k]
              }
            )
          }
        }
        this.formItemConfig.subsets.push({
          name: item.name,
          labels: labels,
          trafficPolicy: {
            loadBalancerDisplay: loadBalancerDisplay,
            loadBalancerType: loadBalancerType,
            loadBalancer: loadBalancer,
            connectionPoolDisplay: connectionPoolDisplay,
            connectionPool: connectionPool,
            outlierDetectionDisplay: outlierDetectionDisplay,
            outlierDetection: outlierDetection
          }
        })
      }
    },
    formEdit () {
      this.nameDisabled = true
      this.getService()
      Get({
        productId: 100,
        resourceName: this.resourceName
      }).then(res => {
        this.dr = res.data
        this.formItem.name = res.data.metadata.name
        this.formItem.labels = []
        // labels 存在进行填充
        if (res.data.metadata.labels) {
          for (const k in res.data.metadata.labels) {
            this.formItem.labels.push(
              {
                'key': k,
                'val': res.data.metadata.labels[k]
              }
            )
          }
        } else { // labels不存在填充空表格
          this.formItem.labels.push(
            {
              'key': '',
              'val': ''
            }
          )
        }
        this.formItemConfig.host = res.data.spec.host
        // global trafficPolicy
        this.trafficPolicy(res.data.spec, 'global')
        // subset
        this.formItemConfig.subsets = [{
          name: '',
          labels: [{
            key: '',
            val: ''
          }],
          trafficPolicy: {
            loadBalancerDisplay: 0,
            loadBalancerType: 'simple',
            loadBalancer: {
              simple: 'ROUND_ROBIN',
              consistentHash: {
                httpCookie: {
                  name: '',
                  path: '',
                  ttl: ''
                }
              }
            },
            connectionPoolDisplay: 0,
            connectionPool: {
              tcp: {
                maxConnections: '',
                connectTimeout: '',
                tcpKeepalive: {
                  time: '',
                  interval: '',
                  probes: ''
                }
              },
              http: {
                http1MaxPendingRequests: '',
                http2MaxRequests: '',
                maxRequestsPerConnection: '',
                maxRetries: '',
                idleTimeout: '',
                h2UpgradePolicy: ''
              }
            },
            outlierDetectionDisplay: 0,
            outlierDetection: {
              consecutiveErrors: '',
              interval: '',
              baseEjectionTime: '',
              maxEjectionPercent: '',
              minHealthPercent: ''
            }
          }
        }]
        // trafficPolicy
        if (res.data.spec.subsets) {
          this.formItemConfig.subsets = []
          res.data.spec.subsets.forEach((item, index) => {
            this.trafficPolicy(item, '')
          })
        }
      })
    }
  }
}
</script>

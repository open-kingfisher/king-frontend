<template>
  <div>
    <information info="虚拟服务：中定义了一系列针对指定服务的流量路由规则。每个路由规则都是针对特定协议的匹配规则。如果流量符合这些特征，就会根据规则发送到服务注册表中的目标服务（或者目标服务的子集或版本）。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
        <ButtonGroup>
          <Button v-if="hasPerm('add_vs')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button v-if="hasPerm('a_add_vs')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px" type="success" ghost>{{ this.$t('advanced_Add') }}</Button>
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
          <Step title="路由规则"></Step>
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
      <Form ref="createFormConfig" v-show="current === 1" :model="formItemConfig" :label-width="60">
        <FormItem label="内网模式">
          <Col span="24">
            <i-switch size="large" v-model="formItemConfig.hostsDisplay" :true-value=1 :false-value=0 @on-change="hostsRouterChange(formItemConfig.hostsDisplay)">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </Col>
        </FormItem>
        <FormItem label="服务名" class="ivu-form-item ivu-form-item-required" v-if="formItemConfig.hostsDisplay === 1">
           <Row type="flex" justify="space-between">
             <Col span="24">
               <FormItem>
                 <Select v-model="formItemConfig.hosts" multiple>
                   <Option v-for="(v, k ) in service" :value="k" :key="k">{{ k }}</Option>
                 </Select>
               </FormItem>
             </Col>
           </Row>
          </FormItem>
        <FormItem label="网关模式">
          <Col span="24">
            <i-switch size="large" v-model="formItemConfig.gatewaysDisplay" :true-value=1 :false-value=0 @on-change="routerHostsChange(formItemConfig.gatewaysDisplay)">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </Col>
        </FormItem>
        <div v-for="(item, index) in formItemConfig.gateways" :key="'gateways' + index" :value="index" v-if="formItemConfig.gatewaysDisplay === 1">
          <FormItem :label="index === 0 ? '网关' : ''" class="ivu-form-item ivu-form-item-required">
           <Row type="flex" justify="space-between">
             <Col span="8">
               <FormItem
                 :prop="'gateways.' + index + '.key'"
                 :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                 <Select v-model="item.key" @on-change="changeGateway(item.key, index)">
                   <Option v-for="g in gateways" :value="g.name" :key="g.name">{{ g.name }}</Option>
                 </Select>
               </FormItem>
             </Col>
             <Col span="2">
               <FormItem class="ivu-form-item ivu-form-item-required" label="域名"></FormItem>
             </Col>
             <Col span="11">
               <FormItem
                :prop="'gateways.' + index + '.hosts'"
                :rules="{required: true, type:'array', message: '该项不能为空', trigger: 'change'}">
                 <Select v-model="item.hosts" multiple>
                    <Option v-for="item in hosts[item.key]" :value="item" :key="item">{{ item }}</Option>
                </Select>
               </FormItem>
             </Col>
             <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('gateways',index)"  :disabled= "formItemConfig.gateways.length === 1" icon="md-trash">
                </Button>
              </Col>
             <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleAdd('gateways', index)" icon="md-add">
                </Button>
              </Col>
           </Row>
          </FormItem>
        </div>
        <div v-for="(item, index) in formItemConfig.http" :key="'http' + index" :value="index">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
          <FormItem label="匹配规则">
            <Col span="23">
              <i-switch size="large" v-model="item.matchDisplay" :true-value=1 :false-value=0>
                <span slot="open">开启</span>
                <span slot="close">关闭</span>
              </i-switch>
            </Col>
            <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('http',index)" :disabled= "formItemConfig.http.length === 1" icon="md-trash">
                </Button>
              </Col>
          </FormItem>
          <FormItem v-if="item.matchDisplay === 1">
            <Row type="flex" justify="space-between">
              <Col span="23">
                <ButtonGroup>
                  <Button @click="handleAdd('uri', index)">URI</Button>
                  <Button @click="handleAdd('scheme', index)">Scheme</Button> <!-- https://en.wikipedia.org/wiki/List_of_URI_schemes -->
                  <Button @click="handleAdd('method', index)">方法</Button>
                  <Button @click="handleAdd('authority', index)">Authority</Button>
                  <Button @click="handleAdd('headers', index)">头</Button>
                  <Button @click="handleAdd('port', index)">端口</Button>
                  <Button @click="handleAdd('sourceLabels', index)">原标签</Button>
                  <Button @click="handleAdd('queryParams', index)">查询参数</Button>
                </ButtonGroup>
              </Col>
            </Row>
          </FormItem>
          <div v-for="(item, i) in formItemConfig.http[index].uri" :key="'uri' + i" :value="i" v-show="formItemConfig.http[index].matchDisplay === 1">
            <FormItem :label="i === 0 ? 'URI': ''">
              <Row type="flex" justify="space-between">
                <Col span="3">
                  <FormItem>
                    <Select v-model="item.key" placeholder="条件">
                      <Option value="exact">精确匹配</Option>
                      <Option value="prefix">前缀匹配</Option>
                      <Option value="regex">正则匹配</Option>
                     </Select>
                  </FormItem>
                </Col>
                <Col :span="item.key === 'regex'? 14: 19">
                  <FormItem
                   :prop="'http.' + index + '.uri.' + i + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.val placeholder="URI">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="5" v-if="item.key === 'regex'">
                  <FormItem :label-width="100" label="忽略URI大小写">
                    <Col span="1">
                      <i-switch size="large" v-model="item.ignoreUriCase" :true-value=true :false-value=false>
                        <span slot="open">是</span>
                        <span slot="close">否</span>
                      </i-switch>
                    </Col>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('uri',index, i)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <div v-for="(item, i) in formItemConfig.http[index].scheme" :key="'scheme' + i" :value="i" v-show="formItemConfig.http[index].matchDisplay === 1">
            <FormItem :label="i === 0 ? 'Scheme': ''">
              <Row type="flex" justify="space-between">
                <Col span="7">
                  <FormItem>
                    <Select v-model="item.key" placeholder="条件">
                      <Option value="exact">精确匹配</Option>
                      <Option value="prefix">前缀匹配</Option>
                      <Option value="regex">正则匹配</Option>
                     </Select>
                  </FormItem>
                </Col>
                <Col span="15">
                  <FormItem
                   :prop="'http.' + index + '.scheme.' + i + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.val placeholder="如: http https ldap">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('scheme',index, i)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <div v-for="(item, i) in formItemConfig.http[index].method" :key="'method' + i" :value="i" v-show="formItemConfig.http[index].matchDisplay === 1">
            <FormItem :label="i === 0 ? '方法': ''">
              <Row type="flex" justify="space-between">
                <Col span="7">
                  <FormItem>
                    <Select v-model="item.key" placeholder="条件">
                      <Option value="exact">精确匹配</Option>
                      <Option value="prefix">前缀匹配</Option>
                      <Option value="regex">正则匹配</Option>
                     </Select>
                  </FormItem>
                </Col>
                <Col span="15">
                  <FormItem
                   :prop="'http.' + index + '.method.' + i + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.val placeholder="如: GET POST">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('method',index, i)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <div v-for="(item, i) in formItemConfig.http[index].authority" :key="'authority' + i" :value="i" v-show="formItemConfig.http[index].matchDisplay === 1">
            <FormItem :label="i === 0 ? 'Authority': ''">
              <Row type="flex" justify="space-between">
                <Col span="7">
                  <FormItem>
                    <Select v-model="item.key" placeholder="条件">
                      <Option value="exact">精确匹配</Option>
                      <Option value="prefix">前缀匹配</Option>
                      <Option value="regex">正则匹配</Option>
                     </Select>
                  </FormItem>
                </Col>
                <Col span="15">
                  <FormItem
                   :prop="'http.' + index + '.authority.' + i + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.val placeholder="如: tom:1234@www.example.com:8080">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('authority',index, i)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <div v-for="(item, i) in formItemConfig.http[index].headers" :key="'headers' + i" :value="i" v-show="formItemConfig.http[index].matchDisplay === 1">
            <FormItem :label="i === 0 ? '头': ''">
              <Row type="flex" justify="space-between">
                <Col span="6">
                  <FormItem
                   :prop="'http.' + index + '.headers.' + i + '.headerKey'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.headerKey placeholder="键">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="3">
                  <FormItem>
                    <Select v-model="item.key" placeholder="条件">
                      <Option value="exact">精确匹配</Option>
                      <Option value="prefix">前缀匹配</Option>
                      <Option value="regex">正则匹配</Option>
                     </Select>
                  </FormItem>
                </Col>
                <Col span="13">
                  <FormItem
                   :prop="'http.' + index + '.headers.' + i + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.val placeholder="值">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('headers',index, i)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <div v-for="(item, i) in formItemConfig.http[index].port" :key="'port' + i" :value="i" v-show="formItemConfig.http[index].matchDisplay === 1">
            <FormItem :label="i === 0 ? '端口': ''">
              <Row type="flex" justify="space-between">
                <Col span="22">
                  <FormItem
                   :prop="'http.' + index + '.port.' + i + '.val'"
                   :rules="[{required: true, message: '该项不能为空', trigger: 'blur'},
                    {required: true, message: '必须是数字', pattern:/^\+?[1-9][0-9]*$/, trigger: 'blur'}]">
                    <Input v-model=item.val>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('port',index, i)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <div v-for="(item, i) in formItemConfig.http[index].sourceLabels" :key="'sourceLabels' + i" :value="i" v-if="formItemConfig.http[index].matchDisplay === 1">
            <FormItem :label="i === 0 ? '原标签': ''">
              <Row type="flex" justify="space-between">
                <Col span="9">
                  <FormItem
                   :prop="'http.' + index + '.sourceLabels.' + i + '.key'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.key placeholder="键">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="13">
                  <FormItem
                   :prop="'http.' + index + '.sourceLabels.' + i + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.val placeholder="值">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('sourceLabels',index, i)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <div v-for="(item, i) in formItemConfig.http[index].queryParams" :key="'queryParams' + i" :value="i" v-if="formItemConfig.http[index].matchDisplay === 1">
            <FormItem :label="i === 0 ? '查询参数': ''">
              <Row type="flex" justify="space-between">
                <Col span="6">
                  <FormItem
                   :prop="'http.' + index + '.queryParams.' + i + '.queryParamsKey'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.queryParamsKey placeholder="键">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="3">
                  <FormItem>
                    <Select v-model="item.key" placeholder="条件">
                      <Option value="exact">精确匹配</Option>
                      <Option value="prefix">前缀匹配</Option>
                      <Option value="regex">正则匹配</Option>
                     </Select>
                  </FormItem>
                </Col>
                <Col span="13">
                  <FormItem
                   :prop="'http.' + index + '.queryParams.' + i + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.val placeholder="查询参数">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('queryParams',index, i)" icon="md-trash">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!-- 路由 -->
          <FormItem label="路由规则">
            <Col span="24">
              <i-switch size="large" v-model="item.routeDisplay" :true-value=1 :false-value=0 @on-change="routerRedirectChange(item.routeDisplay, index)">
                <span slot="open">开启</span>
                <span slot="close">关闭</span>
              </i-switch>
            </Col>
          </FormItem>
          <div v-for="(route, i) in formItemConfig.http[index].route" :key="'route'+ i" :value="i" v-if="item.routeDisplay === 1">
            <hr v-if="i != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px;margin-left: 60px"/>
            <FormItem>
              <Row type="flex" justify="space-between">
                <Col span="2">
                  <FormItem label="目标服务" :label-width="60"></FormItem>
                </Col>
                <Col span="13">
                  <FormItem
                  :prop="'http.' + index + '.route.' + i + '.destination.host'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                    <Select v-model="route.destination.host" placeholder="目标服务" @on-change="changeService(index, i)">
                       <Option v-for="(v, k ) in service" :value="k" :key="k" >{{ k }}</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="2">
                  <FormItem label="端口" :label-width="60"></FormItem>
                </Col>
                <Col span="4">
<!--                  <FormItem-->
<!--                  :prop="'http.' + index + '.route.' + i + '.destination.port.number'"-->
<!--                  :rules="{required: true, type: 'number', message: '该项不能为空', trigger: 'change'}">-->
                  <FormItem>
                    <Select v-model="route.destination.port.number" placeholder="服务端口">
                       <Option v-for="item in service[route.destination.host]" :value="item.port" :key="item.port" >{{ item.port }}</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('route',index, i)" :disabled= "formItemConfig.http[index].route.length === 1" icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleAdd('route', index)" icon="md-add">
                  </Button>
                </Col>
              </Row>
            </FormItem>
            <FormItem>
              <Row type="flex" justify="space-between">
                <Col span="2">
                  <FormItem label="版本标签" :label-width="60"></FormItem>
                </Col>
                <Col span="11">
                  <FormItem>
                    <Select v-model="route.destination.subset" placeholder="版本标签">
                       <Option v-for="item in subset[route.destination.host]" :value="item.name" :key="item.name" >{{ item.name }}</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="2">
                  <FormItem label="权重" :label-width="60"></FormItem>
                </Col>
                <Col span="8">
                  <FormItem>
                    <Slider v-model="route.weight" :tip-format="format" show-input></Slider>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <FormItem style="margin-left: 43px" label="修改请求头" :label-width="90">
              <Col span="24">
                <i-switch size="large" v-model="route.requestHeadersDisplay" :true-value=1 :false-value=0>
                  <span slot="open">开启</span>
                  <span slot="close">关闭</span>
                </i-switch>
              </Col>
            </FormItem>
            <FormItem v-if="route.requestHeadersDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="23">
                  <ButtonGroup>
                    <Button @click="handleAdd('requestAdd', index, i)">添加头信息</Button>
                    <Button @click="handleAdd('requestSet', index, i)">替换头信息</Button>
                    <Button @click="handleAdd('requestRemove', index, i)">删除头信息</Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </FormItem>
            <div style="margin-left: 54px" v-for="(a, ii) in route.requestAdd" :key="'requestAdd'+ ii" :value="ii" v-if="route.requestHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '添加头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="9">
                    <FormItem>
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="13">
                    <FormItem>
                      <Input v-model=a.val>
                        <span slot="prepend">值</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('requestAdd',index, i, ii)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <div style="margin-left: 54px" v-for="(a, ii) in route.requestSet" :key="'requestSet'+ ii" :value="ii" v-if="route.requestHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '替换头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="9">
                    <FormItem>
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="13">
                    <FormItem>
                      <Input v-model=a.val>
                        <span slot="prepend">值</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('requestSet',index, i, ii)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <div style="margin-left: 54px" v-for="(a, ii) in route.requestRemove" :key="'requestRemove'+ ii" :value="ii" v-if="route.requestHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '删除头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="22">
                    <FormItem>
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('requestRemove',index, i, ii)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <FormItem style="margin-left: 43px" label="修改响应头" :label-width="90">
              <Col span="24">
                <i-switch size="large" v-model="route.responseHeadersDisplay" :true-value=1 :false-value=0>
                  <span slot="open">开启</span>
                  <span slot="close">关闭</span>
                </i-switch>
              </Col>
            </FormItem>
            <FormItem v-if="route.responseHeadersDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="23">
                  <ButtonGroup>
                    <Button @click="handleAdd('responseAdd', index, i)">添加头信息</Button>
                    <Button @click="handleAdd('responseSet', index, i)">替换头信息</Button>
                    <Button @click="handleAdd('responseRemove', index, i)">删除头信息</Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </FormItem>
            <div style="margin-left: 54px" v-for="(a, ii) in route.responseAdd" :key="'responseAdd'+ ii" :value="ii" v-if="route.responseHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '添加头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="9">
                    <FormItem>
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="13">
                    <FormItem>
                      <Input v-model=a.val>
                        <span slot="prepend">值</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('responseAdd',index, i, ii)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <div style="margin-left: 54px" v-for="(a, ii) in route.responseSet" :key="'responseSet'+ ii" :value="ii" v-if="route.responseHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '替换头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="9">
                    <FormItem>
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="13">
                    <FormItem>
                      <Input v-model=a.val>
                        <span slot="prepend">值</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('responseSet',index, i, ii)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <div style="margin-left: 54px" v-for="(a, ii) in route.responseRemove" :key="'responseRemove'+ ii" :value="ii" v-if="route.responseHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '删除头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="22">
                    <FormItem>
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('responseRemove',index, i, ii)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
          </div>
          <FormItem>
            <Divider><Button type="dashed" size="small" @click="advancedButton(index)">高级功能</Button></Divider>
          </FormItem>
<!--          <FormItem label="高级功能">-->
<!--            <Col span="24">-->
<!--              <i-switch size="large" v-model="item.advanced" :true-value=1 :false-value=0>-->
<!--                <span slot="open">开启</span>-->
<!--                <span slot="close">关闭</span>-->
<!--              </i-switch>-->
<!--            </Col>-->
<!--          </FormItem>-->
          <div v-if="formItemConfig.http[index].advanced === 1">
            <!-- 重定向 https://istio.io/docs/reference/config/networking/virtual-service/#HTTPRedirect -->
            <FormItem label="重定向">
              <Col span="2">
                <i-switch size="large" v-model="item.redirectDisplay" :true-value=1 :false-value=0 @on-change="redirectRouterChange(item.redirectDisplay, index)">
                  <span slot="open">开启</span>
                  <span slot="close">关闭</span>
                </i-switch>
              </Col>
<!--              <Col span="22">-->
<!--                <p style="color: #808695">HTTPRedirect可用于向调用者发送一个301重定向响应，其中可以使用指定的值交换权限/主机和响应中的URI</p>-->
<!--              </Col>-->
            </FormItem>
            <FormItem v-if="item.redirectDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="10">
                  <FormItem>
                    <Input v-model=item.redirect.uri>
                      <span slot="prepend">URI</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="9">
                  <FormItem>
                    <Input v-model=item.redirect.authority>
                      <span slot="prepend">Authority</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="4">
                  <FormItem>
                    <Input v-model=item.redirect.redirectCode>
                      <span slot="prepend">重定向状态码</span>
                    </Input>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <!-- 重试 https://istio.io/docs/reference/config/networking/virtual-service/#HTTPRedirect -->
            <FormItem label="重试">
              <Col span="24">
                <i-switch size="large" v-model="item.retriesDisplay" :true-value=1 :false-value=0>
                  <span slot="open">开启</span>
                  <span slot="close">关闭</span>
                </i-switch>
              </Col>
            </FormItem>
            <FormItem v-if="item.retriesDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="4">
                   <FormItem
                    :prop="'http.' + index + '.retries.attempts'"
                    :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                    <Input v-model=item.retries.attempts>
                      <span slot="prepend">重试次数</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="5">
                  <FormItem
                    :prop="'http.' + index + '.retries.perTryTimeout'"
                    :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                    <Input v-model=item.retries.perTryTimeout placeholder="可以是小数">
                      <span slot="prepend">超时时间</span>
                      <span slot="append">s</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="14">
                  <FormItem>
                    <Input v-model=item.retries.retryOn placeholder="如: gateway-error,connect-failure,refused-stream 多个使用','分隔">
                      <span slot="prepend">重试条件</span>
                    </Input>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <!-- 重写 https://istio.io/docs/reference/config/networking/virtual-service/#HTTPRewrite -->
            <FormItem  label="重写">
              <Col span="24">
                <i-switch size="large" v-model="item.rewriteDisplay" :true-value=1 :false-value=0>
                  <span slot="open">开启</span>
                  <span slot="close">关闭</span>
                </i-switch>
              </Col>
            </FormItem>
            <FormItem v-if="item.rewriteDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="13">
                  <FormItem>
                    <Input v-model=item.rewrite.uri>
                      <span slot="prepend">URI</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="10">
                  <FormItem>
                    <Input v-model=item.rewrite.authority>
                      <span slot="prepend">Authority</span>
                    </Input>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <!-- global header -->
            <FormItem label="请求头">
                <Col span="24">
                  <i-switch size="large" v-model="item.globalHeaders.requestHeadersDisplay" :true-value=1 :false-value=0>
                    <span slot="open">开启</span>
                    <span slot="close">关闭</span>
                  </i-switch>
                </Col>
              </FormItem>
            <FormItem v-if="item.globalHeaders.requestHeadersDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="23">
                  <ButtonGroup>
                    <Button @click="handleAdd('globalRequestAdd', index)">添加头信息</Button>
                    <Button @click="handleAdd('globalRequestSet', index)">替换头信息</Button>
                    <Button @click="handleAdd('globalRequestRemove', index)">删除头信息</Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </FormItem>
            <div style="margin-left: 54px" v-for="(a, ii) in item.globalHeaders.requestAdd" :key="'globalRequestAdd'+ ii" :value="ii" v-if="item.globalHeaders.requestHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '添加头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="9">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.requestAdd.' + ii + '.key'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="13">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.requestAdd.' + ii + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.val>
                        <span slot="prepend">值</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('globalRequestAdd',index)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <div style="margin-left: 54px" v-for="(a, ii) in item.globalHeaders.requestSet" :key="'globalRequestSet'+ ii" :value="ii" v-if="item.globalHeaders.requestHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '替换头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="9">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.requestSet.' + ii + '.key'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="13">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.requestSet.' + ii + '.key'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.val>
                        <span slot="prepend">值</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('globalRequestSet',index)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <div style="margin-left: 54px" v-for="(a, ii) in item.globalHeaders.requestRemove" :key="'globalRequestRemove'+ ii" :value="ii" v-if="item.globalHeaders.requestHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '删除头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="22">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.requestRemove.' + ii + '.key'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('globalRequestRemove',index)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <FormItem label="响应头">
              <Col span="24">
                <i-switch size="large" v-model="item.globalHeaders.responseHeadersDisplay" :true-value=1 :false-value=0>
                  <span slot="open">开启</span>
                  <span slot="close">关闭</span>
                </i-switch>
              </Col>
            </FormItem>
            <FormItem v-if="item.globalHeaders.responseHeadersDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="23">
                  <ButtonGroup>
                    <Button @click="handleAdd('globalResponseAdd', index)">添加头信息</Button>
                    <Button @click="handleAdd('globalResponseSet', index)">替换头信息</Button>
                    <Button @click="handleAdd('globalResponseRemove', index)">删除头信息</Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </FormItem>
            <div style="margin-left: 54px" v-for="(a, ii) in item.globalHeaders.responseAdd" :key="'globalResponseAdd'+ ii" :value="ii" v-if="item.globalHeaders.responseHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '添加头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="9">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.responseAdd.' + ii + '.key'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="13">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.responseAdd.' + ii + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.val>
                        <span slot="prepend">值</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('globalResponseAdd',index)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <div style="margin-left: 54px" v-for="(a, ii) in item.globalHeaders.responseSet" :key="'globalResponseSet'+ ii" :value="ii" v-if="item.globalHeaders.responseHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '替换头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="9">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.responseSet.' + ii + '.key'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="13">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.responseSet.' + ii + '.val'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.val>
                        <span slot="prepend">值</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('globalResponseSet',index)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <div style="margin-left: 54px" v-for="(a, ii) in item.globalHeaders.responseRemove" :key="'globalResponseRemove'+ ii" :value="ii" v-if="item.globalHeaders.responseHeadersDisplay === 1">
              <FormItem :label="ii === 0 ? '删除头信息' : '' " :label-width="80">
                <Row type="flex" justify="space-between">
                  <Col span="22">
                    <FormItem
                   :prop="'http.' + index + '.globalHeaders.responseRemove.' + ii + '.key'"
                   :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                      <Input v-model=a.key>
                        <span slot="prepend">键</span>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="1" offset="0" style="margin-right: 0px">
                    <Button type="dashed" @click="handleRemove('globalResponseRemove',index)" icon="md-trash">
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </div>
            <!-- mirror -->
            <FormItem  label="流量镜像">
              <Col span="24">
                <i-switch size="large" v-model="item.mirrorDisplay" :true-value=1 :false-value=0>
                  <span slot="open">开启</span>
                  <span slot="close">关闭</span>
                </i-switch>
              </Col>
            </FormItem>
            <FormItem v-if="item.mirrorDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="2">
                  <FormItem label="目标服务" :label-width="60"></FormItem>
                </Col>
                <Col span="14">
                  <FormItem
                  :prop="'http.' + index + '.mirror.host'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                    <Select v-model="item.mirror.host" placeholder="目标服务">
                       <Option v-for="(v, k ) in service" :value="k" :key="k" >{{ k }}</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="2">
                  <FormItem label="端口" :label-width="60"></FormItem>
                </Col>
                <Col span="5">
                  <FormItem>
<!--                  <FormItem-->
<!--                  :prop="'http.' + index + '.mirror.port.number'"-->
<!--                  :rules="{required: true, type: 'number', message: '该项不能为空', trigger: 'change'}">-->
                    <Select v-model="item.mirror.port.number" placeholder="">
                       <Option v-for="s in service[item.mirror.host]" :value="s.port" :key="s.port" >{{ s.port }}</Option>
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <FormItem v-if="item.mirrorDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="2">
                    <FormItem label="版本标签" :label-width="60"></FormItem>
                  </Col>
                  <Col span="8">
                    <FormItem>
                      <Select v-model="item.mirror.subset" placeholder="版本标签">
                         <Option v-for="(v, k ) in subset[item.mirror.host]" :value="v.name" :key="k" >{{ v.name }}</Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span="2">
                    <FormItem label="镜像百分比" :label-width="80"></FormItem>
                  </Col>
                  <Col span="11">
                    <FormItem>
                      <Slider v-model="item.mirror.mirrorPercent" :tip-format="format" show-input></Slider>
                    </FormItem>
                  </Col>
              </Row>
            </FormItem>
            <!-- 故障注入 -->
            <FormItem label="故障注入">
              <Col span="24">
                <i-switch size="large" v-model="item.faultInjectionDisplay" :true-value=1 :false-value=0>
                  <span slot="open">开启</span>
                  <span slot="close">关闭</span>
                </i-switch>
              </Col>
            </FormItem>
            <FormItem  v-if="item.faultInjectionDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="12">
                  <FormItem>
                    <RadioGroup  v-model="item.faultInjectionType" type="button">
                        <Radio label="abort">状态码注入</Radio>
                        <Radio label="delay">延时注入</Radio>
                    </RadioGroup>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <!-- abort -->
            <FormItem v-if="item.faultInjectionType === 'abort' && item.faultInjectionDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="13">
                  <FormItem>
                    <Input v-model="item.abort.percentage" placeholder="可以是小数">
                       <span slot="prepend">百分比</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="10">
                  <FormItem>
                    <Input v-model="item.abort.httpStatus" placeholder="200~599">
                       <span slot="prepend">状态码</span>
                    </Input>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <!-- delay -->
            <FormItem v-if="item.faultInjectionType === 'delay' && item.faultInjectionDisplay === 1">
              <Row type="flex" justify="space-between">
                <Col span="13">
                  <FormItem>
                    <Input v-model="item.delay.percentage" placeholder="可以是小数">
                       <span slot="prepend">百分比</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="10">
                  <FormItem>
                    <Input v-model="item.delay.fixedDelay" placeholder="以秒为单位，可以是小数">
                      <span slot="prepend">延时注入时间</span>
                      <span slot="append">s</span>
                    </Input>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
          </div>
        </div>
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('formItemConfig')" icon="md-add"></Button>
          </Row>
        </FormItem>
      </Form>
      <Form ref="createFormAnnotations" v-show="current === 2" :model="formItemAnnotations" :label-width="55">
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
        <Button type="primary" v-if="current != 2" @click="next">{{this.$t('next')}}</Button>
        <Button type="primary" v-if="current == 2 && option == 'add'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
        <Button type="primary" v-if="current == 2 && option == 'edit'" @click="formOption('EDIT')">{{this.$t('commit')}}</Button>
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
} from '@/api/istio/virtualservices.js'
import { getAllService } from '@/api/discovery'
import { List as listDr } from '@/api/istio/destinationrules.js'
import { List as listGateway } from '@/api/istio/gateways.js'
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
      vs: '',
      subset: [],
      gateways: [],
      hosts: [],
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
      formItemConfig: {
        hostsDisplay: 0,
        hosts: [],
        gatewaysDisplay: 1,
        gateways: [{
          key: '',
          hosts: []
        }],
        http: [
          {
            matchDisplay: 0,
            uri: [],
            scheme: [],
            method: [],
            authority: [],
            headers: [],
            port: [],
            sourceLabels: [],
            queryParams: [],
            routeDisplay: 1,
            route: [{
              destination: {
                host: '', // k8s service name
                port: {
                  number: '' // k8s service port
                },
                subset: ''
              },
              weight: 0,
              headersType: 'request',
              headersAction: 'add',
              requestHeadersDisplay: 0,
              requestRemove: [],
              requestSet: [],
              requestAdd: [],
              responseHeadersDisplay: 0,
              responseRemove: [],
              responseSet: [],
              responseAdd: []
            }],
            advanced: 0,
            redirectDisplay: 0,
            redirect: {
              uri: '',
              authority: '',
              redirectCode: 301
            },
            retriesDisplay: 0,
            retries: {
              attempts: '',
              perTryTimeout: '',
              retryOn: ''
              // perTryTimeoutUnit: 's'
            },
            rewriteDisplay: 0,
            rewrite: {
              uri: '',
              authority: ''
            },
            mirrorDisplay: 0,
            mirror: {
              host: '',
              port: {
                number: ''
              },
              subset: '',
              mirrorPercent: 0
            },
            faultInjectionDisplay: 0,
            faultInjectionType: 'abort',
            abort: {
              percentage: '',
              httpStatus: ''
            },
            delay: {
              percentage: '',
              fixedDelay: ''
            },
            globalHeaders: {
              requestHeadersDisplay: 0,
              requestRemove: [],
              requestSet: [],
              requestAdd: [],
              responseHeadersDisplay: 0,
              responseRemove: [],
              responseSet: [],
              responseAdd: []
            }
          }
        ]
      },
      formItemAnnotations: {
        items: [
          {
            key: '',
            val: ''
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
                    name: 'virtualserviceinfo',
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
          title: this.$t('domain'),
          key: 'hosts',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.values(params.row.hosts).map(item => {
                return h('li', item)
              })
            )
          }
        },
        {
          title: this.$t('gateways'),
          key: 'gateways',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.values(params.row.gateways).map(item => {
                return h('li', item)
              })
            )
          }
        },
        {
          title: this.$t('service'),
          key: 'http',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.values(params.row.http).map(item => {
                return h('li', item)
              })
            )
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
                    disabled: !hasPermission('edit_vs')
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
                      this.getService()
                      this.getDR()
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
                    disabled: !hasPermission('a_edit_vs')
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
                    disabled: !hasPermission('del_vs')
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
    this.getGateways()
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
          let route = []
          if (item.spec.http) {
            item.spec.http.forEach((item, index) => {
              if (item.route) {
                item.route.forEach((r, i) => {
                  let port = ''
                  if (r.destination.port) {
                    port = r.destination.port.number
                  }
                  let subset = ''
                  if (r.destination.subset) {
                    subset = r.destination.subset
                  }
                  route.push(r.destination.host + ':' + port + ':' + subset)
                })
              }
            })
          }
          if (item.spec.tcp) {
            item.spec.tcp.forEach((item, index) => {
              if (item.route) {
                item.route.forEach((r, i) => {
                  let port = ''
                  if (r.destination.port) {
                    port = r.destination.port.number
                  }
                  let subset = ''
                  if (r.destination.subset) {
                    subset = r.destination.subset
                  }
                  route.push(r.destination.host + ':' + port + ':' + subset)
                })
              }
            })
          }
          data.push({
            name: item.metadata.name,
            hosts: item.spec.hosts,
            gateways: item.spec.gateways || {},
            http: route,
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
      this.getGateways()
      this.getService()
      this.getDR()
      this.nameExistCheck = true
      this.current = 0
      this.ingressName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.formAddModel = true
      this.nameDisabled = false
    },
    format (val) {
      return val + '%'
    },
    next () {
      if (this.current === 0) {
        this.$refs['createFormItem'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      } else if (this.current === 1) {
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
    matchDisplay (index) {
      let formItemConfig = this.formItemConfig.http[index]
      if (formItemConfig.uri.length === 0 &&
        formItemConfig.scheme.length === 0 &&
        formItemConfig.method.length === 0 &&
        formItemConfig.authority.length === 0 &&
        formItemConfig.headers.length === 0 &&
        formItemConfig.port.length === 0 &&
        formItemConfig.sourceLabels.length === 0 &&
        formItemConfig.queryParams.length === 0) {
        this.formItemConfig.http[index].matchDisplay = 0
      }
    },
    headDisplay (type, index, secondIndex) {
      let formItemConfig = this.formItemConfig.http[index].route[secondIndex]
      if (type === 'request') {
        if (formItemConfig.requestAdd.length === 0 &&
          formItemConfig.requestSet.length === 0 &&
          formItemConfig.requestRemove.length === 0) {
          this.formItemConfig.http[index].route[secondIndex].requestHeadersDisplay = 0
        }
      } else {
        if (formItemConfig.responseAdd.length === 0 &&
          formItemConfig.responseSet.length === 0 &&
          formItemConfig.responseRemove.length === 0) {
          this.formItemConfig.http[index].route[secondIndex].responseHeadersDisplay = 0
        }
      }
    },
    globalHeadDisplay (type, index) {
      let formItemConfig = this.formItemConfig.http[index].globalHeaders
      if (type === 'request') {
        if (formItemConfig.requestAdd.length === 0 &&
          formItemConfig.requestSet.length === 0 &&
          formItemConfig.requestRemove.length === 0) {
          this.formItemConfig.http[index].globalHeaders.requestHeadersDisplay = 0
        }
      } else {
        if (formItemConfig.responseAdd.length === 0 &&
          formItemConfig.responseSet.length === 0 &&
          formItemConfig.responseRemove.length === 0) {
          this.formItemConfig.http[index].globalHeaders.responseHeadersDisplay = 0
        }
      }
    },
    handleRemove (type, index, secondIndex, thirdlyIndex) {
      if (type === 'formItem') {
        this.formItem.labels.splice(index, 1)
      }
      if (type === 'formItemConfig') {
        this.formItemConfig.http.splice(index, 1)
      }
      if (type === 'hosts') {
        this.formItemConfig.hosts.splice(index, 1)
      }
      if (type === 'gateways') {
        this.formItemConfig.gateways.splice(index, 1)
      }
      if (type === 'http') {
        this.formItemConfig.http.splice(index, 1)
      }
      if (type === 'uri') {
        this.formItemConfig.http[index].uri.splice(secondIndex, 1)
        this.matchDisplay(index)
      }
      if (type === 'scheme') {
        this.formItemConfig.http[index].scheme.splice(secondIndex, 1)
        this.matchDisplay(index)
      }
      if (type === 'method') {
        this.formItemConfig.http[index].method.splice(secondIndex, 1)
        this.matchDisplay(index)
      }
      if (type === 'authority') {
        this.formItemConfig.http[index].authority.splice(secondIndex, 1)
        this.matchDisplay(index)
      }
      if (type === 'headers') {
        this.formItemConfig.http[index].headers.splice(secondIndex, 1)
        this.matchDisplay(index)
      }
      if (type === 'port') {
        this.formItemConfig.http[index].port.splice(secondIndex, 1)
        this.matchDisplay(index)
      }
      if (type === 'sourceLabels') {
        this.formItemConfig.http[index].sourceLabels.splice(secondIndex, 1)
        this.matchDisplay(index)
      }
      if (type === 'queryParams') {
        this.formItemConfig.http[index].queryParams.splice(secondIndex, 1)
        this.matchDisplay(index)
      }
      if (type === 'route') {
        this.formItemConfig.http[index].route.splice(secondIndex, 1)
      }
      if (type === 'requestAdd') {
        this.formItemConfig.http[index].route[secondIndex].requestAdd.splice(thirdlyIndex, 1)
        this.headDisplay('request', index, secondIndex)
      }
      if (type === 'requestSet') {
        this.formItemConfig.http[index].route[secondIndex].requestSet.splice(thirdlyIndex, 1)
        this.headDisplay('request', index, secondIndex)
      }
      if (type === 'requestRemove') {
        this.formItemConfig.http[index].route[secondIndex].requestRemove.splice(thirdlyIndex, 1)
        this.headDisplay('request', index, secondIndex)
      }
      if (type === 'responseAdd') {
        this.formItemConfig.http[index].route[secondIndex].responseAdd.splice(thirdlyIndex, 1)
        this.headDisplay('response', index, secondIndex)
      }
      if (type === 'responseSet') {
        this.formItemConfig.http[index].route[secondIndex].responseSet.splice(thirdlyIndex, 1)
        this.headDisplay('response', index, secondIndex)
      }
      if (type === 'responseRemove') {
        this.formItemConfig.http[index].route[secondIndex].responseRemove.splice(thirdlyIndex, 1)
        this.headDisplay('response', index, secondIndex)
      }
      // Global Header
      if (type === 'globalRequestAdd') {
        this.formItemConfig.http[index].globalHeaders.requestAdd.splice(thirdlyIndex, 1)
        this.globalHeadDisplay('request', index)
      }
      if (type === 'globalRequestSet') {
        this.formItemConfig.http[index].globalHeaders.requestSet.splice(thirdlyIndex, 1)
        this.globalHeadDisplay('request', index)
      }
      if (type === 'globalRequestRemove') {
        this.formItemConfig.http[index].globalHeaders.requestRemove.splice(thirdlyIndex, 1)
        this.globalHeadDisplay('request', index)
      }
      if (type === 'globalResponseAdd') {
        this.formItemConfig.http[index].globalHeaders.responseAdd.splice(thirdlyIndex, 1)
        this.globalHeadDisplay('response', index)
      }
      if (type === 'globalResponseSet') {
        this.formItemConfig.http[index].globalHeaders.responseSet.splice(thirdlyIndex, 1)
        this.globalHeadDisplay('response', index)
      }
      if (type === 'globalResponseRemove') {
        this.formItemConfig.http[index].globalHeaders.responseRemove.splice(thirdlyIndex, 1)
        this.globalHeadDisplay('response', index)
      }
      if (type === 'formItemConfigHosts') {
        this.formItemConfig.servers[index].hosts.splice(secondIndex, 1)
      }
      if (type === 'formItemSelector') {
        this.formItemSelector.selectors.splice(index, 1)
      }
      if (type === 'formItemAnnotations') {
        this.formItemAnnotations.items.splice(index, 1)
      }
    },
    handleAdd (type, index, secondIndex) {
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
      if (type === 'hosts') {
        this.formItemConfig.hosts.push({
          key: ''
        })
      }
      if (type === 'gateways') {
        this.formItemConfig.gateways.push({
          key: '',
          hosts: []
        })
      }
      if (type === 'uri') {
        this.formItemConfig.http[index].uri.push({
          val: '',
          key: 'exact',
          ignoreUriCase: false // 指定URI匹配是否不区分大小写
        })
      }
      if (type === 'scheme') {
        this.formItemConfig.http[index].scheme.push({
          val: '',
          key: 'exact'
        })
      }
      if (type === 'method') {
        this.formItemConfig.http[index].method.push({
          val: '',
          key: 'exact'
        })
      }
      if (type === 'authority') {
        this.formItemConfig.http[index].authority.push({
          val: '',
          key: 'exact'
        })
      }
      if (type === 'headers') {
        this.formItemConfig.http[index].headers.push({
          headerKey: '',
          val: '',
          key: 'exact'
        })
      }
      if (type === 'port') {
        this.formItemConfig.http[index].port.push({
          val: ''
        })
      }
      if (type === 'sourceLabels') {
        this.formItemConfig.http[index].sourceLabels.push({
          val: '',
          key: ''
        })
      }
      if (type === 'queryParams') {
        this.formItemConfig.http[index].queryParams.push({
          queryParamsKey: '',
          val: '',
          key: 'exact'
        })
      }
      if (type === 'route') {
        this.formItemConfig.http[index].route.push(
          {
            destination: {
              host: '', // k8s service name
              port: {
                number: '' // k8s service port
              },
              subset: ''
            },
            weight: 0,
            headersType: 'request',
            headersAction: 'add',
            requestHeadersDisplay: 0,
            requestRemove: [{
              key: ''
            }],
            requestSet: [{
              key: '',
              val: ''
            }],
            requestAdd: [{
              key: '',
              val: ''
            }],
            responseHeadersDisplay: 0,
            responseRemove: [{
              key: ''
            }],
            responseSet: [{
              key: '',
              val: ''
            }],
            responseAdd: [{
              key: '',
              val: ''
            }]
          }
        )
      }
      if (type === 'requestAdd') {
        this.formItemConfig.http[index].route[secondIndex].requestAdd.push(
          {
            key: '',
            val: ''
          }
        )
      }
      if (type === 'requestSet') {
        this.formItemConfig.http[index].route[secondIndex].requestSet.push(
          {
            key: '',
            val: ''
          }
        )
      }
      if (type === 'requestRemove') {
        this.formItemConfig.http[index].route[secondIndex].requestRemove.push(
          {
            key: ''
          }
        )
      }
      if (type === 'responseAdd') {
        this.formItemConfig.http[index].route[secondIndex].responseAdd.push(
          {
            key: '',
            val: ''
          }
        )
      }
      if (type === 'responseSet') {
        this.formItemConfig.http[index].route[secondIndex].responseSet.push(
          {
            key: '',
            val: ''
          }
        )
      }
      if (type === 'responseRemove') {
        this.formItemConfig.http[index].route[secondIndex].responseRemove.push(
          {
            key: ''
          }
        )
      }
      if (type === 'globalRequestAdd') {
        this.formItemConfig.http[index].globalHeaders.requestAdd.push(
          {
            key: '',
            val: ''
          }
        )
      }
      if (type === 'globalRequestSet') {
        this.formItemConfig.http[index].globalHeaders.requestSet.push(
          {
            key: '',
            val: ''
          }
        )
      }
      if (type === 'globalRequestRemove') {
        this.formItemConfig.http[index].globalHeaders.requestRemove.push(
          {
            key: ''
          }
        )
      }
      if (type === 'globalResponseAdd') {
        this.formItemConfig.http[index].globalHeaders.responseAdd.push(
          {
            key: '',
            val: ''
          }
        )
      }
      if (type === 'globalResponseSet') {
        this.formItemConfig.http[index].globalHeaders.responseSet.push(
          {
            key: '',
            val: ''
          }
        )
      }
      if (type === 'globalResponseRemove') {
        this.formItemConfig.http[index].globalHeaders.responseRemove.push(
          {
            key: ''
          }
        )
      }
      if (type === 'formItemConfig') {
        this.formItemConfig.http.push(
          {
            advanced: 0,
            matchDisplay: 0,
            uri: [],
            scheme: [],
            method: [],
            authority: [],
            headers: [],
            port: [],
            sourceLabels: [],
            queryParams: [],
            routeDisplay: 1,
            route: [{
              destination: {
                host: '', // k8s service name
                port: {
                  number: '' // k8s service port
                },
                subset: ''
              },
              weight: 0,
              headersType: 'request',
              headersAction: 'add',
              requestHeadersDisplay: 0,
              requestRemove: [],
              requestSet: [],
              requestAdd: [],
              responseHeadersDisplay: 0,
              responseRemove: [],
              responseSet: [],
              responseAdd: []
            }],
            redirectDisplay: 0,
            redirect: {
              uri: '',
              authority: '',
              redirectCode: 301
            },
            retriesDisplay: 0,
            retries: {
              attempts: '',
              perTryTimeout: '',
              retryOn: ''
              // perTryTimeoutUnit: 's'
            },
            rewriteDisplay: 0,
            rewrite: {
              uri: '',
              authority: ''
            },
            mirrorDisplay: 0,
            mirror: {
              host: '',
              port: {
                number: ''
              },
              subset: '',
              mirrorPercent: 0
            },
            faultInjectionDisplay: 0,
            faultInjectionType: 'abort',
            abort: {
              percentage: '',
              httpStatus: ''
            },
            delay: {
              percentage: '',
              fixedDelay: ''
            },
            globalHeaders: {
              requestHeadersDisplay: 0,
              requestRemove: [],
              requestSet: [],
              requestAdd: [],
              responseHeadersDisplay: 0,
              responseRemove: [],
              responseSet: [],
              responseAdd: []
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
    getGateways () {
      this.gateways = []
      this.hosts = {}
      listGateway({
        productId: 100
      }).then(res => {
        res.data.forEach((item, index) => {
          let hosts = []
          item.spec.servers.forEach((item, index) => {
            item.hosts.forEach((h, i) => {
              hosts.push(h)
            })
          })
          this.gateways.push({
            name: item.metadata.name,
            hosts: hosts
          })
          this.hosts[item.metadata.name] = hosts
        })
      })
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
    getDR () {
      listDr({
        productId: 100
      }).then(res => {
        this.subset = {}
        forEach(res.data, (item, index) => {
          let newSub = []
          if (item.spec.subsets && item.spec.host) {
            if (this.subset[item.spec.host]) {
              newSub = this.subset[item.spec.host].concat(item.spec.subsets)
              this.subset[item.spec.host] = newSub
            } else {
              this.subset[item.spec.host] = item.spec.subsets
            }
          }
        })
      })
    },
    changeGateway (value, index) {
      this.formItemConfig.gateways[index].hosts = []
      // this.gateways.forEach((item, index) => {
      //   if (value === item.name) {
      //     this.hosts = item.hosts
      //   }
      // })
    },
    changeService (index, i) {
      this.formItemConfig.http[index].route[i].destination.subset = ''
      this.formItemConfig.http[index].route[i].destination.port.number = ''
    },
    routerRedirectChange (value, index) {
      if (value === 1) {
        this.formItemConfig.http[index].redirectDisplay = 0
      } else {
        this.formItemConfig.http[index].redirectDisplay = 1
      }
    },
    redirectRouterChange (value, index) {
      if (value === 1) {
        this.formItemConfig.http[index].routeDisplay = 0
      } else {
        this.formItemConfig.http[index].routeDisplay = 1
      }
    },
    routerHostsChange (value) {
      if (value === 1) {
        this.formItemConfig.hostsDisplay = 0
      } else {
        this.formItemConfig.hostsDisplay = 1
      }
    },
    hostsRouterChange (value) {
      if (value === 1) {
        this.formItemConfig.gatewaysDisplay = 0
      } else {
        this.formItemConfig.gatewaysDisplay = 1
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
          'hosts': [],
          'gateways': [],
          'http': []
        }
      }
      if (this.formItem.labels.length > 0) {
        this.formItem.labels.forEach((item, index) => {
          if (item.key) {
            json.metadata.labels[item.key] = item.val
          }
        })
      }
      // gateway
      if (this.formItemConfig.gatewaysDisplay === 1) {
        this.formItemConfig.gateways.forEach((item, index) => {
          json.spec.gateways.push(item.key)
          let tmp = json.spec.hosts
          json.spec.hosts = tmp.concat(item.hosts)
        })
      } else {
        delete json['spec']['gateways']
      }
      // hosts
      if (this.formItemConfig.hostsDisplay === 1) {
        this.formItemConfig.hosts.forEach((item, index) => {
          json.spec.hosts.push(item)
        })
      }
      // http
      if (this.formItemConfig.http.length > 0) {
        this.formItemConfig.http.forEach((item, index) => {
          // match
          let match = []
          if (item.matchDisplay === 1) {
            // uri
            if (item.uri.length > 0) {
              item.uri.forEach((u, i) => {
                if (u.val) {
                  let tmp = {}
                  tmp[u.key] = u.val
                  match.push({
                    'uri': tmp,
                    'ignoreUriCase': tmp.ignoreUriCase
                  })
                }
              })
            }
            // scheme
            if (item.scheme.length > 0) {
              item.scheme.forEach((u, i) => {
                if (u.val) {
                  let tmp = {}
                  tmp[u.key] = u.val
                  match.push({
                    'scheme': tmp
                  })
                }
              })
            }
            // method
            if (item.method.length > 0) {
              item.method.forEach((u, i) => {
                if (u.val) {
                  let tmp = {}
                  tmp[u.key] = u.val
                  match.push({
                    'method': tmp
                  })
                }
              })
            }
            // authority
            if (item.authority.length > 0) {
              item.authority.forEach((u, i) => {
                if (u.val) {
                  let tmp = {}
                  tmp[u.key] = u.val
                  match.push({
                    'authority': tmp
                  })
                }
              })
            }
            // headers
            if (item.headers.length > 0) {
              item.headers.forEach((u, i) => {
                if (u.headerKey) {
                  let tmpKey = {}
                  let tmp = {}
                  tmp[u.key] = u.val
                  tmpKey[u.headerKey] = tmp
                  match.push({
                    'headers': tmpKey
                  })
                }
              })
            }
            // port
            if (item.port.length > 0) {
              item.port.forEach((u, i) => {
                if (u.val) {
                  match.push({
                    'port': u.val
                  })
                }
              })
            }
            // sourceLabels
            if (item.sourceLabels.length > 0) {
              let tmp = {}
              item.sourceLabels.forEach((u, i) => {
                if (u.key) {
                  tmp[u.key] = u.val
                }
              })
              match.push({
                'sourceLabels': tmp
              })
            }
            // headers
            if (item.queryParams.length > 0) {
              item.queryParams.forEach((u, i) => {
                if (u.queryParamsKey) {
                  let tmpKey = {}
                  let tmp = {}
                  tmp[u.key] = u.val
                  tmpKey[u.queryParamsKey] = tmp
                  match.push({
                    'queryParams': tmpKey
                  })
                }
              })
            }
          }
          // route
          let route = []
          if (item.route.length > 0 && item.routeDisplay === 1) {
            item.route.forEach((u, i) => {
              // request
              let request = {}
              if (u.requestHeadersDisplay === 1) {
                if (u.requestAdd.length > 0) {
                  let add = {}
                  u.requestAdd.forEach((u, i) => {
                    add[u.key] = u.val
                  })
                  request['add'] = add
                }
                if (u.requestSet.length > 0) {
                  let set = {}
                  u.requestSet.forEach((u, i) => {
                    set[u.key] = u.val
                  })
                  request['set'] = set
                }
                if (u.requestRemove.length > 0) {
                  let remove = []
                  u.requestRemove.forEach((u, i) => {
                    remove.push(u.key)
                  })
                  request['remove'] = remove
                }
              }
              // response
              let response = {}
              if (u.responseHeadersDisplay === 1) {
                if (u.responseAdd.length > 0) {
                  let add = {}
                  u.responseAdd.forEach((u, i) => {
                    add[u.key] = u.val
                  })
                  response['add'] = add
                }
                if (u.responseSet.length > 0) {
                  let set = {}
                  u.responseSet.forEach((u, i) => {
                    set[u.key] = u.val
                  })
                  response['set'] = set
                }
                if (u.responseRemove.length > 0) {
                  let remove = []
                  u.responseRemove.forEach((u, i) => {
                    remove.push(u.key)
                  })
                  response['remove'] = remove
                }
              }
              let routerItem = {
                'destination': {
                  'host': u.destination.host,
                  'port': {
                    'number': u.destination.port.number
                  },
                  'subset': u.destination.subset
                },
                'weight': u.weight,
                'headers': {
                  'request': request,
                  'response': response
                }
              }
              if (u.destination.port.number === '') {
                delete routerItem['destination']['port']
              }
              if (!u.destination.subset) {
                delete routerItem['destination']['subset']
              }
              if (!u.weight || u.weight === 0) {
                delete routerItem['weight']
              }
              if (JSON.stringify(request) === '{}') {
                delete routerItem['headers']['request']
              }
              if (JSON.stringify(response) === '{}') {
                delete routerItem['headers']['response']
              }
              if (JSON.stringify(routerItem['headers']) === '{}') {
                delete routerItem['headers']
              }
              route.push(routerItem)
            })
          }
          // redirect
          let redirect = {}
          if (item.redirectDisplay === 1) {
            redirect = {
              'uri': item.redirect.uri,
              'authority': item.redirect.authority,
              'redirectCode': item.redirect.redirectCode
            }
          }
          // retries
          let retries = {}
          if (item.retriesDisplay === 1) {
            retries = {
              'attempts': parseInt(item.retries.attempts),
              'perTryTimeout': item.retries.perTryTimeout + 's',
              'retryOn': item.retries.retryOn
            }
          }
          // rewrite
          let rewrite = {}
          if (item.rewriteDisplay === 1) {
            rewrite = {
              'uri': item.rewrite.uri,
              'authority': item.rewrite.authority
            }
          }
          // global header
          let globalRequest = {}
          if (item.globalHeaders.requestHeadersDisplay) {
            if (item.globalHeaders.requestAdd.length > 0) {
              let add = {}
              item.globalHeaders.requestAdd.forEach((u, i) => {
                add[u.key] = u.val
              })
              globalRequest['add'] = add
            }
            if (item.globalHeaders.requestSet.length > 0) {
              let set = {}
              item.globalHeaders.requestSet.forEach((u, i) => {
                set[u.key] = u.val
              })
              globalRequest['set'] = set
            }
            if (item.globalHeaders.requestRemove.length > 0) {
              let remove = []
              item.globalHeaders.requestRemove.forEach((u, i) => {
                remove.push(u.key)
              })
              globalRequest['remove'] = remove
            }
          }
          // global Response
          let globalResponse = {}
          if (item.globalHeaders.responseHeadersDisplay === 1) {
            if (item.globalHeaders.responseAdd.length > 0) {
              let add = {}
              item.globalHeaders.responseAdd.forEach((u, i) => {
                add[u.key] = u.val
              })
              globalResponse['add'] = add
            }
            if (item.globalHeaders.responseSet.length > 0) {
              let set = {}
              item.globalHeaders.responseSet.forEach((u, i) => {
                set[u.key] = u.val
              })
              globalResponse['set'] = set
            }
            if (item.globalHeaders.responseRemove.length > 0) {
              let remove = []
              item.globalHeaders.responseRemove.forEach((u, i) => {
                remove.push(u.key)
              })
              globalResponse['remove'] = remove
            }
          }
          // mirror
          let mirror = {}
          let mirrorPercent = 0
          if (item.mirrorDisplay === 1) {
            mirror = {
              'host': item.mirror.host,
              'port': {
                'number': item.mirror.port.number
              },
              'subset': item.mirror.subset
            }
            mirrorPercent = item.mirror.mirrorPercent
            if (mirror.port.number === '') {
              delete mirror['port']
            }
          }
          // faultInjection
          let abort = {}
          let delay = {}
          if (item.faultInjectionDisplay === 1) {
            if (item.faultInjectionType === 'abort') {
              abort = {
                'httpStatus': item.abort.httpStatus,
                'percentage': {
                  'value': item.abort.percentage
                }
              }
            }
            if (item.faultInjectionType === 'delay') {
              delay = {
                'fixedDelay': item.delay.fixedDelay + 's',
                'percentage': {
                  'value': item.delay.percentage
                }
              }
            }
            if (item.abort.percentage === '') {
              delete abort['percentage']
            }
            if (item.delay.percentage === '') {
              delete delay['percentage']
            }
          }
          let http = {
            'match': match,
            'route': route,
            'redirect': redirect,
            'retries': retries,
            'rewrite': rewrite,
            'mirror': mirror,
            'headers': {
              'request': globalRequest,
              'response': globalResponse
            },
            'mirrorPercent': mirrorPercent,
            'fault': {
              'abort': abort,
              'delay': delay
            }
          }
          if (match.length === 0) {
            delete http['match']
          }
          if (route.length === 0) {
            delete http['route']
          }
          if (JSON.stringify(redirect) === '{}') {
            delete http['redirect']
          }
          if (JSON.stringify(retries) === '{}') {
            delete http['retries']
          }
          if (JSON.stringify(rewrite) === '{}') {
            delete http['rewrite']
          }
          if (JSON.stringify(globalRequest) === '{}') {
            delete http['headers']['request']
          }
          if (JSON.stringify(globalResponse) === '{}') {
            delete http['headers']['response']
          }
          if (JSON.stringify(globalRequest) === '{}' && JSON.stringify(globalResponse) === '{}') {
            delete http['headers']
          }
          if (JSON.stringify(mirror) === '{}') {
            delete http['mirror']
            delete http['mirrorPercent']
          }
          if (JSON.stringify(abort) === '{}') {
            delete http['fault']['abort']
          }
          if (JSON.stringify(delay) === '{}') {
            delete http['fault']['delay']
          }
          if (JSON.stringify(http['fault']) === '{}') {
            delete http['fault']
          }
          json.spec.http.push(http)
        })
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
        if (json.spec.http.length === 0) {
          delete json['spec']['http']
        }
        json.metadata.resourceVersion = this.vs.metadata.resourceVersion
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
    advancedButton (index) {
      if (this.formItemConfig.http[index].advanced === 0) {
        this.formItemConfig.http[index].advanced = 1
      } else {
        this.formItemConfig.http[index].advanced = 0
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
      this.formItemConfig = {
        hostsDisplay: 0,
        hosts: [],
        gatewaysDisplay: 1,
        gateways: [{
          key: '',
          hosts: []
        }],
        http: [
          {
            matchDisplay: 0,
            uri: [],
            scheme: [],
            method: [],
            authority: [],
            headers: [],
            port: [],
            sourceLabels: [],
            queryParams: [],
            routeDisplay: 1,
            route: [{
              destination: {
                host: '', // k8s service name
                port: {
                  number: '' // k8s service port
                },
                subset: ''
              },
              weight: 0,
              headersType: 'request',
              headersAction: 'add',
              requestHeadersDisplay: 0,
              requestRemove: [],
              requestSet: [],
              requestAdd: [],
              responseHeadersDisplay: 0,
              responseRemove: [],
              responseSet: [],
              responseAdd: []
            }],
            advanced: 0,
            redirectDisplay: 0,
            redirect: {
              uri: '',
              authority: '',
              redirectCode: 301
            },
            retriesDisplay: 0,
            retries: {
              attempts: '',
              perTryTimeout: '',
              retryOn: ''
              // perTryTimeoutUnit: 's'
            },
            rewriteDisplay: 0,
            rewrite: {
              uri: '',
              authority: ''
            },
            mirrorDisplay: 0,
            mirror: {
              host: '',
              port: {
                number: ''
              },
              subset: '',
              mirrorPercent: 0
            },
            faultInjectionDisplay: 0,
            faultInjectionType: 'abort',
            abort: {
              percentage: '',
              httpStatus: ''
            },
            delay: {
              percentage: '',
              fixedDelay: ''
            },
            globalHeaders: {
              requestHeadersDisplay: 0,
              requestRemove: [],
              requestSet: [],
              requestAdd: [],
              responseHeadersDisplay: 0,
              responseRemove: [],
              responseSet: [],
              responseAdd: []
            }
          }
        ]
      }
    },
    formEdit () {
      this.nameDisabled = true
      Get({
        productId: 100,
        resourceName: this.resourceName
      }).then(res => {
        this.vs = res.data
        this.formItem.name = res.data.metadata.name
        this.formItem.labels = []
        // labels 存在进行填充
        if (res.data.metadata.labels) {
          for (const k in res.data.metadata.labels) {
            this.formItem.labels.push({
              'key': k,
              'val': res.data.metadata.labels[k]
            })
          }
        } else { // labels不存在填充空表格
          this.formItem.labels.push({
            'key': '',
            'val': ''
          })
        }
        // hosts
        this.formItemConfig.hostsDisplay = 0
        // Gateway
        this.formItemConfig.gatewaysDisplay = 0
        this.formItemConfig.gateways = [{
          'key': '',
          'hosts': ''
        }]
        if (res.data.spec.gateways) {
          this.formItemConfig.gatewaysDisplay = 1
          this.formItemConfig.gateways = []
          res.data.spec.gateways.forEach((item, index) => {
            if (this.hosts[item]) {
              this.formItemConfig.gateways.push({
                'key': item,
                'hosts': this.hosts[item].filter(function (v) {
                  return res.data.spec.hosts.indexOf(v) > -1
                }) // 交集
              })
            } else {
              this.formItemConfig.gateways.push({
                'key': '',
                'hosts': ''
              })
            }
          })
        } else {
          this.formItemConfig.hostsDisplay = 1
          this.formItemConfig.hosts = []
          res.data.spec.hosts.forEach((item, index) => {
            this.formItemConfig.hosts.push(item)
          })
        }
        this.formItemConfig.http = []
        res.data.spec.http.forEach((item, index) => {
          let advanced = 0
          let uri = []
          let scheme = []
          let method = []
          let authority = []
          let headers = []
          let port = []
          let sourceLabels = []
          let queryParams = []
          let matchDisplay = 0
          if (item.match) {
            matchDisplay = 1
            item.match.forEach((m, i) => {
              // uri
              if (m.uri) {
                if (m.uri.exact) {
                  uri.push({
                    val: m.uri.exact,
                    key: 'exact',
                    ignoreUriCase: false
                  })
                }
                if (m.uri.prefix) {
                  uri.push({
                    val: m.uri.prefix,
                    key: 'prefix',
                    ignoreUriCase: false
                  })
                }
                if (m.uri.regex) {
                  uri.push({
                    val: m.uri.regex,
                    key: 'regex',
                    ignoreUriCase: m.ignoreUriCase
                  })
                }
              }
              // scheme
              if (m.scheme) {
                if (m.scheme.exact) {
                  scheme.push({
                    val: m.scheme.exact,
                    key: 'exact'
                  })
                }
                if (m.scheme.prefix) {
                  scheme.push({
                    val: m.scheme.prefix,
                    key: 'prefix'
                  })
                }
                if (m.scheme.regex) {
                  scheme.push({
                    val: m.scheme.regex,
                    key: 'regex'
                  })
                }
              }
              // method
              if (m.method) {
                if (m.method.exact) {
                  method.push({
                    val: m.method.exact,
                    key: 'exact'
                  })
                }
                if (m.method.prefix) {
                  method.push({
                    val: m.method.prefix,
                    key: 'prefix'
                  })
                }
                if (m.method.regex) {
                  method.push({
                    val: m.method.regex,
                    key: 'regex'
                  })
                }
              }
              // authority
              if (m.authority) {
                if (m.authority.exact) {
                  authority.push({
                    val: m.authority.exact,
                    key: 'exact'
                  })
                }
                if (m.authority.prefix) {
                  authority.push({
                    val: m.authority.prefix,
                    key: 'prefix'
                  })
                }
                if (m.authority.regex) {
                  authority.push({
                    val: m.authority.regex,
                    key: 'regex'
                  })
                }
              }
              // headers
              if (m.headers) {
                for (let h in m.headers) {
                  if (m.headers[h].exact) {
                    headers.push({
                      headerKey: h,
                      val: m.headers[h].exact,
                      key: 'exact'
                    })
                  }
                  if (m.headers[h].prefix) {
                    headers.push({
                      headerKey: h,
                      val: m.headers[h].prefix,
                      key: 'prefix'
                    })
                  }
                  if (m.headers[h].regex) {
                    headers.push({
                      headerKey: h,
                      val: m.headers[h].regex,
                      key: 'regex'
                    })
                  }
                }
              }
              // port
              if (m.port) {
                port.push({ val: m.port.toString() })
              }
              // sourceLabels
              if (m.sourceLabels) {
                for (let h in m.sourceLabels) {
                  sourceLabels.push({
                    val: m.sourceLabels[h],
                    key: h
                  })
                }
              }
              // queryParams
              if (m.queryParams) {
                for (let h in m.queryParams) {
                  if (m.queryParams[h].exact) {
                    queryParams.push({
                      queryParamsKey: h,
                      val: m.queryParams[h].exact,
                      key: 'exact'
                    })
                  }
                  if (m.queryParams[h].prefix) {
                    queryParams.push({
                      queryParamsKey: h,
                      val: m.queryParams[h].prefix,
                      key: 'prefix'
                    })
                  }
                  if (m.queryParams[h].regex) {
                    queryParams.push({
                      queryParamsKey: h,
                      val: m.queryParams[h].regex,
                      key: 'regex'
                    })
                  }
                }
              }
            })
          }
          // redirect
          let redirectDisplay = 0
          let redirect = {}
          if (item.redirect) {
            advanced = 1
            redirectDisplay = 1
            redirect = {
              uri: item.redirect.uri,
              authority: item.redirect.authority,
              redirectCode: item.redirect.redirectCode ? item.redirect.redirectCode : 301
            }
          }
          // retries
          let retriesDisplay = 0
          let retries = {}
          if (item.retries) {
            advanced = 1
            retriesDisplay = 1
            retries = {
              attempts: item.retries.attempts.toString(),
              perTryTimeout: item.retries.perTryTimeout.replace(/[a-z]*/ig, ''),
              retryOn: item.retries.retryOn
              // perTryTimeoutUnit: item.retries.perTryTimeout.replace(/^[0-9]*/ig, '')
            }
          }
          let rewriteDisplay = 0
          let rewrite = {}
          if (item.rewrite) {
            advanced = 1
            rewriteDisplay = 1
            rewrite = {
              uri: item.rewrite.uri,
              authority: item.rewrite.authority
            }
          }
          // global header
          let globalResponseAdd = []
          let globalResponseSet = []
          let globalResponseRemove = []
          let globalResponseHeadersDisplay = 0
          let globalRequestAdd = []
          let globalRequestSet = []
          let globalRequestRemove = []
          let globalRequestHeadersDisplay = 0
          if (item.headers) {
            advanced = 1
            if (item.headers.response) {
              globalResponseHeadersDisplay = 1
              if (item.headers.response.add) {
                for (let res in item.headers.response.add) {
                  globalResponseAdd.push({
                    key: res,
                    val: item.headers.response.add[res]
                  })
                }
              }
              if (item.headers.response.set) {
                for (let res in item.headers.response.set) {
                  globalResponseSet.push({
                    key: res,
                    val: item.headers.response.set[res]
                  })
                }
              }
              if (item.headers.response.remove) {
                item.headers.response.remove.forEach((res, index) => {
                  globalResponseRemove.push({ key: res })
                })
              }
            }
            if (item.headers.request) {
              globalRequestHeadersDisplay = 1
              if (item.headers.request.add) {
                for (let res in item.headers.request.add) {
                  globalRequestAdd.push({
                    key: res,
                    val: item.headers.request.add[res]
                  })
                }
              }
              if (item.headers.request.set) {
                for (let res in item.headers.request.set) {
                  globalRequestSet.push({
                    key: res,
                    val: item.headers.request.set[res]
                  })
                }
              }
              if (item.headers.request.remove) {
                item.headers.request.remove.forEach((res, index) => {
                  globalRequestRemove.push({ key: res })
                })
              }
            }
          }
          // mirror
          let mirrorDisplay = 0
          let mirror = {
            host: '',
            port: {
              number: ''
            },
            subset: '',
            mirrorPercent: 0
          }
          if (item.mirror) {
            advanced = 1
            mirrorDisplay = 1
            mirror = {
              host: '',
              port: {
                number: ''
              },
              subset: '',
              mirrorPercent: ''
            }
            if (item.mirror.host) {
              mirror.host = item.mirror.host
            }
            if (item.mirror.port && item.mirror.port.number) {
              mirror.port['number'] = item.mirror.port.number
            }
            if (item.mirror.subset) {
              mirror.subset = item.mirror.subset
            }
            if (item.mirrorPercent) {
              mirror.mirrorPercent = item.mirrorPercent
            }
          }
          // fault injection
          let faultInjectionDisplay = 0
          let abort = {}
          let delay = {}
          let faultInjectionType = ''
          if (item.fault) {
            advanced = 1
            faultInjectionDisplay = 1
            if (item.fault.abort) {
              faultInjectionType = 'abort'
              abort = {
                percentage: item.fault.abort.percentage ? item.fault.abort.percentage.value : '',
                httpStatus: item.fault.abort.httpStatus
              }
            }
            if (item.fault.delay) {
              faultInjectionType = 'delay'
              delay = {
                percentage: item.fault.delay.percentage ? item.fault.delay.percentage.value : '',
                fixedDelay: item.fault.delay.fixedDelay.replace(/[a-z]*/ig, '')
              }
            }
          }
          // route
          let routeDisplay = 0
          let route = [{
            destination: {
              host: '',
              port: {
                number: ''
              },
              subset: ''
            },
            weight: 0,
            headersType: 'request',
            headersAction: 'add',
            requestHeadersDisplay: 0,
            requestRemove: [],
            requestSet: [],
            requestAdd: [],
            responseHeadersDisplay: 0,
            responseRemove: [],
            responseSet: [],
            responseAdd: []
          }]
          if (item.route) {
            routeDisplay = 1
            route = []
            item.route.forEach((r, i) => {
              let destination = {
                host: '',
                port: {
                  number: ''
                },
                subset: ''
              }
              if (r.destination.host) {
                destination.host = r.destination.host
              }
              if (r.destination.port && r.destination.port.number) {
                destination.port['number'] = r.destination.port.number
              }
              // if (JSON.stringify(destination.port) === '{}') {
              //   delete destination['port']
              // }
              if (r.destination.subset) {
                destination.subset = r.destination.subset
              }
              // headers
              let responseAdd = []
              let responseSet = []
              let responseRemove = []
              let responseHeadersDisplay = 0
              let requestAdd = []
              let requestSet = []
              let requestRemove = []
              let requestHeadersDisplay = 0
              if (r.headers) {
                advanced = 1
                if (r.headers.response) {
                  responseHeadersDisplay = 1
                  if (r.headers.response.add) {
                    for (let res in r.headers.response.add) {
                      responseAdd.push({
                        key: res,
                        val: r.headers.response.add[res]
                      })
                    }
                  }
                  if (r.headers.response.set) {
                    for (let res in r.headers.response.set) {
                      responseSet.push({
                        key: res,
                        val: r.headers.response.set[res]
                      })
                    }
                  }
                  if (r.headers.response.remove) {
                    r.headers.response.remove.forEach((res, index) => {
                      responseRemove.push({ key: res })
                    })
                  }
                }
                if (r.headers.request) {
                  requestHeadersDisplay = 1
                  if (r.headers.request.add) {
                    for (let res in r.headers.request.add) {
                      requestAdd.push({
                        key: res,
                        val: r.headers.request.add[res]
                      })
                    }
                  }
                  if (r.headers.request.set) {
                    for (let res in r.headers.request.set) {
                      requestSet.push({
                        key: res,
                        val: r.headers.request.set[res]
                      })
                    }
                  }
                  if (r.headers.request.remove) {
                    r.headers.request.remove.forEach((res, index) => {
                      requestRemove.push({ key: res })
                    })
                  }
                }
              }
              route.push({
                destination: destination,
                weight: r.weight,
                requestHeadersDisplay: requestHeadersDisplay,
                responseHeadersDisplay: responseHeadersDisplay,
                responseRemove: responseRemove,
                responseAdd: responseAdd,
                responseSet: responseSet,
                requestRemove: requestRemove,
                requestAdd: requestAdd,
                requestSet: requestSet
              })
            })
          }
          this.formItemConfig.http.push({
            advanced: advanced,
            matchDisplay: matchDisplay,
            uri: uri,
            scheme: scheme,
            method: method,
            authority: authority,
            headers: headers,
            port: port,
            sourceLabels: sourceLabels,
            queryParams: queryParams,
            redirectDisplay: redirectDisplay,
            redirect: redirect,
            retriesDisplay: retriesDisplay,
            retries: retries,
            rewriteDisplay: rewriteDisplay,
            globalHeaders: {
              requestHeadersDisplay: globalRequestHeadersDisplay,
              requestRemove: globalRequestRemove,
              requestSet: globalRequestSet,
              requestAdd: globalRequestAdd,
              responseHeadersDisplay: globalResponseHeadersDisplay,
              responseRemove: globalResponseRemove,
              responseSet: globalResponseSet,
              responseAdd: globalResponseAdd
            },
            rewrite: rewrite,
            mirrorDisplay: mirrorDisplay,
            mirror: mirror,
            faultInjectionDisplay: faultInjectionDisplay,
            faultInjectionType: faultInjectionType,
            abort: abort,
            delay: delay,
            routeDisplay: routeDisplay,
            route: route
          })
        })
      })
    }
  }
}
</script>

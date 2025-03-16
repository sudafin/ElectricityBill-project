# 用户界面按钮样式更新说明

我们已经更新了用户界面中所有按钮的样式，使其采用胶囊形状（圆角白底蓝字）的设计。以下是使用这些新按钮样式的几种方法：

## 方法一：直接添加 CSS 类

为任何 `el-button` 组件添加 `capsule-button` 类即可应用胶囊样式：

```vue
<el-button class="capsule-button">按钮文本</el-button>
```

## 方法二：使用封装的 EBButton 组件

我们创建了一个封装的 `EBButton` 组件，它自动应用了胶囊样式：

```vue
<EBButton>按钮文本</EBButton>
```

这个组件支持 `el-button` 的所有属性：

```vue
<EBButton type="primary" size="small">主要按钮</EBButton>
```

## 方法三：使用自定义指令

我们也提供了一个自定义指令 `v-capsule`，可以自动将按钮转换为胶囊样式：

```vue
<el-button v-capsule>按钮文本</el-button>
```

## 样式覆盖和变体

所有 Element Plus 的按钮类型都已经适配了胶囊样式：

- 默认按钮: `<el-button class="capsule-button">`
- 主要按钮: `<el-button class="capsule-button" type="primary">`
- 成功按钮: `<el-button class="capsule-button" type="success">`
- 警告按钮: `<el-button class="capsule-button" type="warning">`
- 危险按钮: `<el-button class="capsule-button" type="danger">`
- 信息按钮: `<el-button class="capsule-button" type="info">`
- 文本按钮: `<el-button class="capsule-button" text>`
- 小型按钮: `<el-button class="capsule-button" size="small">`

## 激活状态

对于标签或切换按钮，您可以使用 `active-capsule` 类显示激活状态：

```vue
<el-button 
  class="capsule-button" 
  :class="{ 'active-capsule': isActive }"
>
  按钮文本
</el-button>
```

## 注意事项

- 胶囊按钮样式已在全局 CSS 中定义，您可以在任何用户界面组件中使用它
- 您无需在用户界面组件中重新定义这些样式
- 这些样式仅应用于用户界面，不会影响管理界面的按钮样式 
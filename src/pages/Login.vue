<template>
  <div class="login-page">
    <h1>欢迎登陆我的站点</h1>
    <div class="login-table">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleFormRef"
        label-width="100px"
      >
        <el-form-item label="账号" prop="name">
          <el-input v-model="ruleForm.name" ref="name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pswd">
          <el-input v-model="ruleForm.pswd" ref="pswd"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login()">登录</el-button>
          <el-button @click="register()">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import httpService from "@/service/http.service";
import accountService from "@/service/account.service";
import { reactive, ref } from "@vue/reactivity";
import { ElNotification } from 'element-plus';
import { nextTick } from '@vue/runtime-core';
export default {
  name: "login",

  setup() {
    const router = useRouter();
    const ruleFormRef = ref();
    const ruleForm = reactive({
      name: "",
      pswd: "",
    });
    console.log('ruleForm', ruleForm.name)
    const rules = ref({
      name: [
        { required: true, message: "请输入账号", trigger: "blur" },
        {
          min: 3,
          max: 18,
          message: "长度在 3 到 18 个字符",
          trigger: "blur",
        },
      ],
      pswd: [{ required: true, validator: validatePass, trigger: "blur" }],
    });

    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        // 放正则
        callback();
      }
    };

    // const checkValid = () => {
    //   return ruleFormRef.value.validate();
    // };

    const login = () => {
      if (!ruleFormRef.value.validate()) {
        console.log("格式不规范");
        return;
      }
      httpService.login(ruleForm.name, ruleForm.pswd).then(
        (res) => {
          accountService.login(ruleForm.name, res.token);
          toHome();
          nextTick(() => {
            showSuccess("登录成功");
          });
        },
        (err) => {
          showReject("登录失败", err.data.message);

        }
      );
    };

    const register = () => {
      ruleFormRef.value.validate((valid) => {
        if (valid) {
          httpService.register(ruleForm.name, ruleForm.pswd).then(
            () => {
              showSuccess("注册成功", "正在自动登录");
              login();
            },
            (err) => {
              showReject("注册失败", err.data.message);
            }
          );
        } else {
          console.log("格式不规范");
        }
      });
    };

    const toHome = () => {
      router.push({
        name: "dashboard",
      });
    };

    const showSuccess = (title, msg) => {
      ElNotification({
        title: title,
        message: msg,
        type: "success",
      })
    };

    const showReject = (title, msg) => {
      ElNotification({
        title: title,
        message: msg,
        type: "error",
      })
    };

    return {
      ruleFormRef,
      ruleForm,
      rules,
      toHome,
      login,
      register,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.login-page {
  padding-top: 60px;
}
h1,
h2 {
  font-weight: normal;
}
.login-page {
  position: relative;
  width: 100%;
  .login-table {
    position: relative;
    margin: 0 auto;
    width: 500px;
  }
}
</style>

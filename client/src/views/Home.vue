<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Star,
  Monitor,
  Iphone,
  DataAnalysis,
  MagicStick,
  Paperclip,
  Setting,
  Box,
  ArrowUp,
} from "@element-plus/icons-vue";
import { ElASender } from "element-ai-vue";

const router = useRouter();
const input = ref("");

const handleSend = () => {
  if (!input.value.trim()) return;
  router.push({ name: "chat", query: { q: input.value } });
};
</script>

<template>
  <div class="home-page">
    <div class="content-wrapper">
      <!-- Title -->
      <h1 class="main-title">Element AI</h1>

      <!-- Input Area -->
      <div class="input-section">
        <div class="input-container-wrapper">
          <ElASender
            v-model="input"
            placeholder="尽管问..."
            variant="updown"
            class="custom-sender"
            @send="handleSend"
          >
            <template #button>
              <div class="send-btn-wrapper" @click="handleSend">
                <el-icon><ArrowUp /></el-icon>
              </div>
            </template>
          </ElASender>
        </div>
      </div>

      <!-- Action Chips -->
      <div class="chips-row">
        <div class="chip">
          <el-icon><Star /></el-icon> 推荐
        </div>
        <div class="chip">
          <el-icon><Monitor /></el-icon> 网页应用
        </div>
        <div class="chip">
          <el-icon><Iphone /></el-icon> 移动应用
        </div>
        <div class="chip">
          <el-icon><DataAnalysis /></el-icon> 数据分析
        </div>
        <div class="chip">
          <el-icon><MagicStick /></el-icon> 灵感
        </div>
      </div>

      <!-- Cards Carousel -->
      <div class="cards-row">
        <div class="feature-card">
          <div class="card-tag">数据分析</div>
          <div class="card-title">AI 股价与财报深度分析</div>
          <div class="card-preview">
            <div class="preview-box">
              <div class="stat-row">
                <span class="label">执行摘要</span>
              </div>
              <div class="stat-grid">
                <div class="stat-item">315.7%</div>
                <div class="stat-item">37.8%</div>
                <div class="stat-item">10.45</div>
              </div>
            </div>
          </div>
        </div>

        <div class="feature-card highlight">
          <div class="card-tag">前端项目</div>
          <div class="card-title">富士滤镜实验室</div>
          <div class="card-subtitle">FUJI FILTER LABORATORY</div>
          <div class="card-preview image-preview">
            <!-- Simulated image content -->
            <div class="lab-icon">🔬</div>
          </div>
        </div>

        <div class="feature-card">
          <div class="card-tag green">数据分析</div>
          <div class="card-title">Q3 财报深度分析</div>
          <div class="card-preview">
            <div class="preview-table">
              <div class="table-header"></div>
              <div class="table-row"></div>
              <div class="table-row"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--text-color);
  background-color: var(--app-bg-color);
  transition: background-color 0.3s, color 0.3s;
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 40px;
  letter-spacing: 2px;
  color: var(--text-color);
}

.input-section {
  width: 100%;
  margin-bottom: 24px;
}

.input-container-wrapper {
  background-color: var(--input-bg-color);
  border: 1px solid var(--input-border-color);
  border-radius: 16px;
  padding: 8px;
  transition: border-color 0.3s;

  &:focus-within {
    border-color: var(--text-color-secondary);
  }
}

:deep(.el-ai-sender) {
  height: 100px;

  background-color: transparent;
  border: none;
  padding: 0;
  --el-a-sender-bg-color: transparent;
  --el-a-sender-text-color: var(--text-color);
  --el-a-sender-placeholder-text-color: var(--text-color-secondary);

  .el-textarea__inner {
    color: var(--text-color);
    box-shadow: none;
    resize: none;
  }
}

.bottom-left-controls {
  display: flex;
  align-items: center;
  gap: 8px;

  .icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--text-color-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-secondary);
    cursor: pointer;
    font-size: 14px;

    &:hover {
      color: var(--text-color);
      border-color: var(--text-color);
    }
  }

  .pill-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border: 1px solid var(--text-color-secondary);
    border-radius: 16px;
    font-size: 12px;
    color: var(--text-color-secondary);
    cursor: pointer;
    height: 28px;

    &:hover {
      color: var(--text-color);
      border-color: var(--text-color);
    }
  }
}

.bottom-right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  margin-right: 12px;

  .model-selector {
    font-size: 12px;
    color: var(--text-color-secondary);
    cursor: pointer;
    &:hover {
      color: var(--text-color);
    }
  }

  .action-icon {
    font-size: 18px;
    color: var(--text-color-secondary);
    cursor: pointer;
    &:hover {
      color: var(--text-color);
    }
  }

  .divider {
    width: 1px;
    height: 16px;
    background-color: var(--input-border-color);
  }
}

.send-btn-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #000;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  .el-icon {
    font-size: 16px;
    font-weight: bold;
  }
}

html.dark .send-btn-wrapper {
  background-color: #ededed;
  color: #000;
}

html:not(.dark) .send-btn-wrapper {
  background-color: #000;
  color: #fff;
}

.chips-row {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;

  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    background-color: var(--chip-bg-color);
    border: 1px solid var(--chip-border-color);
    border-radius: 20px;
    font-size: 14px;
    color: var(--text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: var(--item-hover-bg);
      border-color: var(--text-color-secondary);
      color: var(--text-color);
    }
  }
}

.cards-row {
  display: flex;
  gap: 20px;
  width: 100%;
  justify-content: center;
}

.feature-card {
  flex: 1;
  background-color: var(--card-bg-color);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  min-height: 160px;
  transition: transform 0.2s, background-color 0.3s;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--input-border-color);

  &:hover {
    transform: translateY(-4px);
    background-color: var(--card-hover-bg);
  }

  .card-tag {
    font-size: 10px;
    color: var(--text-color-secondary);
    margin-bottom: 8px;

    &.green {
      color: #67c23a;
    }
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--text-color);
  }

  .card-subtitle {
    font-size: 10px;
    color: var(--text-color-secondary);
    margin-bottom: 12px;
  }

  .card-preview {
    flex: 1;
    background-color: var(--input-bg-color);
    border-radius: 8px;
    margin-top: 8px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--input-border-color);

    &.image-preview {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      border: none;
    }

    .lab-icon {
      font-size: 24px;
    }

    .preview-box {
      width: 100%;

      .stat-row {
        border-bottom: 1px solid var(--input-border-color);
        margin-bottom: 4px;
        padding-bottom: 2px;
        .label {
          font-size: 8px;
          color: var(--text-color-secondary);
        }
      }
      .stat-grid {
        display: flex;
        gap: 4px;
        .stat-item {
          font-size: 8px;
          color: #d63031;
          background: var(--chip-bg-color);
          padding: 2px;
          border-radius: 2px;
        }
      }
    }

    .preview-table {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      .table-header {
        height: 8px;
        background: var(--chip-border-color);
        border-radius: 2px;
      }
      .table-row {
        height: 6px;
        background: var(--chip-bg-color);
        border-radius: 2px;
      }
    }
  }
}
</style>

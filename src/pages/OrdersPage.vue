<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('nav.orders')"
        subtitle="Bekijk en beheer je bestellingen met onze geavanceerde orderbeheersysteem"
        icon="shopping_cart"
        badge="Binnenkort"
        badge-color="info"
        :meta="[
          { icon: 'shopping_cart', text: 'Bestellingen module' },
          { icon: 'schedule', text: 'Binnenkort beschikbaar' }
        ]"
      >
        <template #actions>
          <q-btn
            color="primary"
            icon="arrow_back"
            label="Terug naar Dashboard"
            @click="goToDashboard"
            class="btn-modern"
            unelevated
          />
        </template>
      </PageTitle>
    </template>

    <!-- Coming Soon Section -->
    <div class="coming-soon-section animate-slide-up">
      <!-- Main Coming Soon Card -->
      <q-card class="coming-soon-card card-modern card-elevated">
        <q-card-section class="coming-soon-content">
          <div class="coming-soon-icon">
            <div class="icon-container">
              <q-icon name="shopping_cart" size="80px" />
            </div>
          </div>
          
          <div class="coming-soon-text">
            <h2 class="coming-soon-title">Bestellingen komen binnenkort</h2>
            <p class="coming-soon-description">
              Deze functionaliteit wordt momenteel ontwikkeld en zal binnenkort beschikbaar zijn.
              Je kunt dan je bestellingsgeschiedenis bekijken, facturen downloaden en nieuwe bestellingen plaatsen.
            </p>
          </div>

          <!-- Progress Indicator -->
          <div class="development-progress">
            <div class="progress-header">
              <span class="progress-label">Ontwikkelingsvoortgang</span>
              <span class="progress-percentage">75%</span>
            </div>
            <q-linear-progress 
              :value="0.75" 
              color="primary" 
              size="8px" 
              rounded 
              class="progress-bar"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Features Preview Grid -->
      <div class="features-section">
        <div class="features-header">
          <h3 class="features-title">Geplande functies</h3>
          <p class="features-subtitle">Ontdek wat er allemaal mogelijk wordt</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card glass-card animate-scale-in" style="animation-delay: 0.1s">
            <div class="feature-icon">
              <q-icon name="history" size="32px" color="primary" />
            </div>
            <div class="feature-content">
              <h4 class="feature-title">Bestellingsgeschiedenis</h4>
              <p class="feature-description">
                Bekijk alle vorige bestellingen met gedetailleerde informatie en statusupdates
              </p>
              <div class="feature-status">
                <q-chip color="info" text-color="white" size="sm">In ontwikkeling</q-chip>
              </div>
            </div>
          </div>

          <div class="feature-card glass-card animate-scale-in" style="animation-delay: 0.2s">
            <div class="feature-icon">
              <q-icon name="add_shopping_cart" size="32px" color="secondary" />
            </div>
            <div class="feature-content">
              <h4 class="feature-title">Nieuwe bestellingen</h4>
              <p class="feature-description">
                Plaats bestellingen direct vanuit voorraad met automatische leverancier matching
              </p>
              <div class="feature-status">
                <q-chip color="warning" text-color="dark" size="sm">Gepland</q-chip>
              </div>
            </div>
          </div>

          <div class="feature-card glass-card animate-scale-in" style="animation-delay: 0.3s">
            <div class="feature-icon">
              <q-icon name="receipt" size="32px" color="accent" />
            </div>
            <div class="feature-content">
              <h4 class="feature-title">Factuur beheer</h4>
              <p class="feature-description">
                Download en beheer facturen met automatische boekhouding integratie
              </p>
              <div class="feature-status">
                <q-chip color="positive" text-color="white" size="sm">Bijna klaar</q-chip>
              </div>
            </div>
          </div>

          <div class="feature-card glass-card animate-scale-in" style="animation-delay: 0.4s">
            <div class="feature-icon">
              <q-icon name="track_changes" size="32px" color="info" />
            </div>
            <div class="feature-content">
              <h4 class="feature-title">Order tracking</h4>
              <p class="feature-description">
                Volg de status van je bestellingen in real-time met notificaties
              </p>
              <div class="feature-status">
                <q-chip color="info" text-color="white" size="sm">In ontwikkeling</q-chip>
              </div>
            </div>
          </div>

          <div class="feature-card glass-card animate-scale-in" style="animation-delay: 0.5s">
            <div class="feature-icon">
              <q-icon name="auto_awesome" size="32px" color="warning" />
            </div>
            <div class="feature-content">
              <h4 class="feature-title">Automatische bestellingen</h4>
              <p class="feature-description">
                Stel automatische bestellingen in gebaseerd op voorraadniveaus
              </p>
              <div class="feature-status">
                <q-chip color="warning" text-color="dark" size="sm">Gepland</q-chip>
              </div>
            </div>
          </div>

          <div class="feature-card glass-card animate-scale-in" style="animation-delay: 0.6s">
            <div class="feature-icon">
              <q-icon name="integration_instructions" size="32px" color="positive" />
            </div>
            <div class="feature-content">
              <h4 class="feature-title">Magento integratie</h4>
              <p class="feature-description">
                Directe koppeling met webshop voor naadloze orderverwerking
              </p>
              <div class="feature-status">
                <q-chip color="positive" text-color="white" size="sm">Bijna klaar</q-chip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Information -->
      <div class="technical-section">
        <q-expansion-item
          class="technical-expansion"
          icon="code"
          label="Technische informatie (voor ontwikkelaars)"
          header-class="technical-header"
        >
          <q-card class="technical-card card-modern">
            <q-card-section>
              <div class="technical-content">
                <div class="technical-intro">
                  <h4 class="technical-title">Magento API Integratie</h4>
                  <p class="technical-description">
                    Deze pagina zal worden geïntegreerd met de Magento API voor volledige orderbeheerfunctionaliteit:
                  </p>
                </div>
                
                <div class="api-endpoints">
                  <div class="endpoint-item">
                    <div class="endpoint-method">GET</div>
                    <div class="endpoint-details">
                      <div class="endpoint-path">/rest/V1/orders</div>
                      <div class="endpoint-description">Ophalen van bestellingsgeschiedenis</div>
                    </div>
                  </div>
                  
                  <div class="endpoint-item">
                    <div class="endpoint-method post">POST</div>
                    <div class="endpoint-details">
                      <div class="endpoint-path">/rest/V1/orders</div>
                      <div class="endpoint-description">Nieuwe bestellingen plaatsen</div>
                    </div>
                  </div>
                  
                  <div class="endpoint-item">
                    <div class="endpoint-method">GET</div>
                    <div class="endpoint-details">
                      <div class="endpoint-path">/rest/V1/invoices</div>
                      <div class="endpoint-description">Factuur gegevens ophalen</div>
                    </div>
                  </div>
                </div>

                <div class="technical-note">
                  <q-chip color="info" text-color="white" icon="info" size="sm">
                    API placeholder services zijn al voorbereid in src/services/magento/
                  </q-chip>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageLayout from 'src/components/PageLayout.vue'
import PageTitle from 'src/components/PageTitle.vue'

const router = useRouter()
const { t } = useI18n()

const goToDashboard = () => {
  router.push({ name: 'dashboard' })
}
</script>

<style lang="scss" scoped>
// Coming soon section
.coming-soon-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.coming-soon-card {
  text-align: center;
  
  .coming-soon-content {
    padding: var(--space-12) var(--space-8);
    
    .coming-soon-icon {
      margin-bottom: var(--space-6);
      
      .icon-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 120px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
        color: white;
        box-shadow: var(--shadow-md);
        animation: iconFloat 3s ease-in-out infinite;
      }
    }
    
    .coming-soon-text {
      margin-bottom: var(--space-8);
      
      .coming-soon-title {
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--neutral-900);
        margin: 0 0 var(--space-4) 0;
      }
      
      .coming-soon-description {
        font-size: var(--text-lg);
        color: var(--neutral-600);
        line-height: var(--leading-relaxed);
        max-width: 600px;
        margin: 0 auto;
      }
    }
    
    .development-progress {
      max-width: 400px;
      margin: 0 auto;
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-3);
        
        .progress-label {
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--neutral-700);
        }
        
        .progress-percentage {
          font-size: var(--text-sm);
          font-weight: var(--font-weight-bold);
          color: var(--brand-primary);
        }
      }
      
      .progress-bar {
        border-radius: var(--radius-full);
        overflow: hidden;
      }
    }
  }
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

// Features section
.features-section {
  .features-header {
    text-align: center;
    margin-bottom: var(--space-8);
    
    .features-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--neutral-900);
      margin: 0 0 var(--space-2) 0;
    }
    
    .features-subtitle {
      font-size: var(--text-lg);
      color: var(--neutral-600);
      margin: 0;
    }
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-6);
  }
}

.feature-card {
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  .feature-icon {
    margin-bottom: var(--space-4);
  }
  
  .feature-content {
    .feature-title {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin: 0 0 var(--space-2) 0;
    }
    
    .feature-description {
      font-size: var(--text-base);
      color: var(--neutral-600);
      line-height: var(--leading-relaxed);
      margin: 0 0 var(--space-4) 0;
    }
    
    .feature-status {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
  }
}

// Technical section
.technical-section {
  margin-top: var(--space-12);
  
  .technical-expansion {
    border-radius: var(--radius-xl);
    overflow: hidden;
    
    .technical-header {
      background: var(--neutral-50);
      padding: var(--space-4) var(--space-6);
      font-weight: var(--font-weight-medium);
    }
  }
  
  .technical-card {
    border-radius: 0;
    box-shadow: none;
    border-top: 1px solid var(--neutral-200);
  }
  
  .technical-content {
    padding: var(--space-6);
    
    .technical-intro {
      margin-bottom: var(--space-6);
      
      .technical-title {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--neutral-900);
        margin: 0 0 var(--space-2) 0;
      }
      
      .technical-description {
        font-size: var(--text-base);
        color: var(--neutral-600);
        margin: 0;
      }
    }
    
    .api-endpoints {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      
      .endpoint-item {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-3);
        border-radius: var(--radius-lg);
        background: var(--neutral-50);
        
        .endpoint-method {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-base);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-bold);
          color: white;
          background: var(--brand-primary);
          
          &.post {
            background: var(--brand-secondary);
          }
          
          &.put {
            background: var(--brand-warning);
          }
          
          &.delete {
            background: var(--brand-danger);
          }
        }
        
        .endpoint-details {
          flex: 1;
          
          .endpoint-path {
            font-family: var(--font-family-mono);
            font-size: var(--text-sm);
            font-weight: var(--font-weight-medium);
            color: var(--neutral-900);
            margin-bottom: var(--space-1);
          }
          
          .endpoint-description {
            font-size: var(--text-sm);
            color: var(--neutral-600);
            margin: 0;
          }
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .coming-soon-card .coming-soon-content {
    padding: var(--space-8) var(--space-4);
  }
  
  .feature-card {
    padding: var(--space-4);
  }
  
  .technical-content {
    padding: var(--space-4);
  }
  
  .endpoint-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}

// Dark mode adjustments
body.body--dark {
  .coming-soon-title {
    color: var(--neutral-100);
  }
  
  .coming-soon-description {
    color: var(--neutral-400);
  }
  
  .features-title {
    color: var(--neutral-100);
  }
  
  .features-subtitle {
    color: var(--neutral-400);
  }
  
  .feature-title {
    color: var(--neutral-100);
  }
  
  .feature-description {
    color: var(--neutral-400);
  }
  
  .technical-header {
    background: var(--neutral-200);
  }
  
  .technical-card {
    border-top-color: var(--neutral-300);
  }
  
  .technical-title {
    color: var(--neutral-100);
  }
  
  .technical-description {
    color: var(--neutral-400);
  }
  
  .endpoint-item {
    background: var(--neutral-200);
    
    .endpoint-path {
      color: var(--neutral-100);
    }
    
    .endpoint-description {
      color: var(--neutral-400);
    }
  }
  
  .progress-label {
    color: var(--neutral-400);
  }
}
</style>
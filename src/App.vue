<template>
  <div class="container my-3 mx-5">
    <form class="form" @submit.prevent="submitForm">
      <div class="columns is-mobile">
        <div class="column">
          <b-field label="Interaction Date">
            <b-datepicker
                v-model="interaction_date"
                placeholder="Type or select a date..."
                :locale="locale"
                icon="calendar-today"
                editable>
            </b-datepicker>
        </b-field>
        </div>
        <div class="column">
          <b-field label="Nature of Interaction">
            <b-select v-model="interaction_type">
                <option
                    v-for="option in all_interaction_types"
                    :value="option"
                    :key="option">
                    {{ option }}
                </option>
            </b-select>
          </b-field>
        </div>
      </div>
      <div class="columns is-mobile">
        <div class="column">
          <b-field label="Client Rating">
            <b-select v-model="client_rating">
                <option
                    v-for="option in all_client_ratings"
                    :value="option"
                    :key="option">
                    {{ option }}
                </option>
            </b-select>
          </b-field>
        </div>
           <div class="column">
          <b-field label="Lead Status">
            <b-select v-model="lead_status_for_date">
                <option
                    v-for="option in lead_status"
                    :value="option"
                    :key="option">
                    {{ option }}
                </option>
            </b-select>
          </b-field>
        </div>
        <div class="column">
          <b-field v-if="this.interaction_type == 'Call' " label="Call Type">
            <b-select v-model="call_type">
                <option
                    v-for="option in all_call_types"
                    :value="option"
                    :key="option">
                    {{ option }}
                </option>
            </b-select>
          </b-field>
          <b-field v-if="this.interaction_type == 'Walkin' " label="Is this a 1st time call walk-in ?">
            <b-select v-model="walk_type">
                <option
                    v-for="option in all_walkin"
                    :value="option"
                    :key="option">
                    {{ option }}
                </option>
            </b-select>
          </b-field>
        </div>
      </div>
      <div class="columns is-mobile" v-if="this.getRecord.Mobile">
        <div class="column" v-if="this.client_rating == 'No Response'">
          <b-button type="is-info" icon-left="whatsapp" @click="openWhatsApp">Send WhatsApp</b-button>
        </div>
      </div>
      <b-field label="Comments">
        <b-input v-model="comments" maxlength="200" type="textarea"></b-input>
      </b-field>
      <b-field  v-if="this.lead_status_for_date == 'Not Responding' || this.lead_status_for_date == 'Processing with OA' || this.lead_status_for_date == 'Offer received through OA' || this.lead_status_for_date == 'In Processing with Us' || this.lead_status_for_date== 'Confirmation Deposit paid'|| this.lead_status_for_date=='In application'|| this.lead_status_for_date=='Offer received'|| this.lead_status_for_date=='Unconditional offer awaiting'|| this.lead_status_for_date=='Awaiting other offer'|| this.lead_status_for_date=='Will pay to the received offer'||this.lead_status_for_date=='1st sem paid'||this.lead_status_for_date=='Full fee paid'||this.lead_status_for_date=='Connected with  other agent(OA)  too'||this.lead_status_for_date=='Future lead' " label="Followup Date" message="Task will be created to followup on this date">
            <b-datepicker
                v-model="followup_date"
                placeholder="Type or select a date..."
                :locale="locale"
                icon="calendar-today"
                editable>
            </b-datepicker>
        </b-field>
      <div class="field is-grouped is-pulled-right">
          <div class="control">
            <button class="button is-link">Submit</button>
          </div>
        </div>
    </form>
    <b-loading :is-full-page="true" v-model="isLoading" :can-cancel="false"></b-loading>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { format, addDays } from "date-fns";
import { ZOHO } from "@/assets/ZohoEmbededAppSDK.min.js";
export default {
  name: "App",
  data() {
    return {
      isLoading: false,
      interaction_date: new Date(),
      locale: 'en-IN',
      all_interaction_types: ["Call", "Walkin"],
      all_call_types: ["Inbound", "Outbound"],
      all_walkin: ["Yes", "No"],
      all_client_ratings: ["Very Interested", "Interested", "Confused", "May Drop", "Dropped", "No Response","Competitor Involved","Fund Issue","Not Satisfied","Not Interested"],
      lead_status:["In Processing with Us","In application","Offer received","Unconditional offer awaiting","Awaiting other offer","Will pay to the received offer","Confirmation Deposit paid","1st sem paid","Full fee paid","Connected with  other agent(OA)  too","Processing with OA","Offer received through OA","Fee paid through OA","Not Responding","Future lead","Completed","Failed","Dropped","Not Qualified","Junk Lead"],
      interaction_type: '',
      lead_status_for_date:'',
      call_type: '',
      walk_type: '',
      client_rating: '',
      comments: '',
      followup_date: new Date(),
      max_interaction_date: addDays(new Date(), 1),
    };
  },
  computed: {
    ...mapGetters(["getEntity", "getRecord", "getUser"]),
  },
  mounted() {
    this.followup_date = addDays(this.interaction_date, 7);
  },
  watch: {
    getEntity() {
      this.$store.dispatch("setRecord");
    },
    getUser() {
      this.locale = this.getUser.locale_code.replace("_", "-");
    },
    interaction_date() {
      this.followup_date = addDays(this.interaction_date, 7);
    },
  },
  methods: {
    ...mapActions(["setRecord"]),
    ////note creation on submit
    submitForm() {
      this.isLoading = true;
      let note_title = `${this.interaction_type == 'Call' ? this.call_type : '' } ${this.interaction_type == 'Walkin' ?"Is this a 1st time call walk-in: " + this.walk_type : '' } ${this.interaction_type}-${this.client_rating}`;
      ZOHO.CRM.API.addNotes({
        Entity: this.getEntity.Entity,
        RecordID: this.getEntity.EntityId,
        Title: note_title,
        Content: this.comments
      })
      ///////task creation based on lead status
      .then(()=> {
        

        if(this.lead_status_for_date == 'Not Responding' || this.lead_status_for_date == 'Processing with OA' || this.lead_status_for_date == 'Offer received through OA' || this.lead_status_for_date == 'In Processing with Us' || this.lead_status_for_date== 'Confirmation Deposit paid'|| this.lead_status_for_date=='In application'|| this.lead_status_for_date=='Offer received'|| this.lead_status_for_date=='Unconditional offer awaiting'|| this.lead_status_for_date=='Awaiting other offer'|| this.lead_status_for_date=='Will pay to the received offer'||this.lead_status_for_date=='1st sem paid'||this.lead_status_for_date=='Full fee paid'||this.lead_status_for_date=='Connected with  other agent(OA)  too'||this.lead_status_for_date=='Future lead')
        {
        console.log("task creation");
         let task_payload = {
          Subject: `[${this.client_rating}] Followup with ${this.getRecord.Full_Name}`,
          se_module: this.getEntity.Entity,
          What_Id: this.getEntity.EntityId[0],
          Due_Date: format(this.followup_date, "yyyy-MM-dd"),

        };
        ZOHO.CRM.API.insertRecord({
          Entity: "Tasks",
          APIData: task_payload
        })
        .then(() => {
          console.log("Task added");
          this.$buefy.toast.open({
            message: 'Followup details added successfully',
            type: 'is-success'
          });
        })
        ////////////lead status updation
        .then(()=>{
         console.log('lead updation');
        var config={
            Entity:"Leads",
           APIData:{
            id: this.getEntity.EntityId[0],
            Lead_Status:this.lead_status_for_date,
            Rating_of_client_interest: this.client_rating
                    },
           Trigger:["workflow"]
          }
    
         ZOHO.CRM.API.updateRecord(config)
         .then(function(data){
           console.log("config");
         console.log(config);
          console.log("data");
         console.log(data)
        })
       })
        .catch( (error) => {
            this.$buefy.toast.open({
            message: `Unable to add task, please try again later`,
            position: 'is-top',
            type: 'is-danger'
          })
          console.error(error)
        })
        .finally(() => {
          this.isLoading = false;
        })
        }
/////// lead status and client rating updating///////        
        else{
          this.$buefy.toast.open({
            message: 'Note added successfully',
            position: 'is-top',
            type: 'is-success'
          });
           var config={
            Entity:"Leads",
           APIData:{
            id: this.getEntity.EntityId[0],
            Lead_Status:this.lead_status_for_date,
            Rating_of_client_interest: this.client_rating
                    },
           Trigger:["workflow"]
          }
         console.log(config);
        ZOHO.CRM.API.updateRecord(config)
         .then(function(data){
         
         console.log(config);
         console.log(data)
          console.log("Note added");
        })
         
        }
      
      })
      .catch( (error) => {
        this.$buefy.toast.open({
          message: `Unable to add note, please try again later`,
          position: 'is-top',
          type: 'is-danger'
        })
        console.error(error);
      })
      .finally(() => {
        this.isLoading = false;
      })
      

    },
    openWhatsApp() {
      // https://api.whatsapp.com/send/?phone={number}&text={message}
      var msg = `Hi ${this.getRecord.Full_Name}, This is ${this.getUser.full_name} from Salve Maria. We tried to reach you and call wasn't answered. We will be available to assist your immigration process on this number.`;
      var url = `https://web.whatsapp.com/send?phone=91${this.getRecord.Mobile}&text=${encodeURIComponent(msg)}`;
      window.open(url);
    }
    
  },

};
</script>



